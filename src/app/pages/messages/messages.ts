import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatContext, ConversationInbox } from '../../interfaces/conversation';
import { ChatMessage } from '../../interfaces/message';
import { Auth } from '../../services/auth';
import { ConversationService } from '../../services/conversation';
import { MessageService } from '../../services/message';
import { SocketService } from '../../services/socket';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-messages',
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages implements OnInit, OnDestroy {
  @ViewChild('messagesEnd') messagesEnd?: ElementRef<HTMLDivElement>;

  private route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private auth = inject(Auth);
  private conversationService = inject(ConversationService);
  private messageService = inject(MessageService);
  private socketService = inject(SocketService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  inbox = signal<ConversationInbox[]>([]);
  messages = signal<ChatMessage[]>([]);
  activeConversationId = signal<number | null>(null);
  activeChatContext = signal<ChatContext | null>(null);
  partnerNames = signal<Record<number, string>>({});

  loadingInbox = signal(true);
  loadingMessages = signal(false);
  sending = signal(false);
  errorMessage = signal('');

  newMessage = '';

  private routeSub?: Subscription;
  private navigationState: Record<string, unknown> | null = null;

  private readonly onNewMessage = (message: ChatMessage) => {
    if (message.conversation_id !== this.activeConversationId()) return;

    this.messages.update((current) => {
      if (current.some((item) => item.id === message.id)) return current;
      return [...current, message];
    });

    this.scrollToBottom();
    this.cdr.detectChanges();
  };

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.navigationState =
      this.router.getCurrentNavigation()?.extras?.state ??
      (typeof history !== 'undefined' ? history.state : null);

    this.loadInbox();

    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.openConversation(id);
      } else {
        this.activeConversationId.set(null);
        this.activeChatContext.set(null);
        this.messages.set([]);
        this.socketService.offNewMessage(this.onNewMessage);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.socketService.offNewMessage(this.onNewMessage);
  }

  get currentUserId(): number | null {
    return this.auth.currentUser()?.id ?? null;
  }

  getActiveConversation(): ConversationInbox | null {
    const id = this.activeConversationId();
    if (!id) return null;

    return (
      this.inbox().find((item) => Number(item.conversation_id) === Number(id)) ?? null
    );
  }

  getOtherParticipantId(conversation: ConversationInbox): number {
    const userId = this.currentUserId;
    if (!userId) return Number(conversation.seller_id);

    return Number(userId) === Number(conversation.buyer_id)
      ? Number(conversation.seller_id)
      : Number(conversation.buyer_id);
  }

  getOtherParticipantName(conversation: ConversationInbox): string {
    const cached = this.partnerNames()[conversation.conversation_id];
    if (cached) return cached;

    const userId = this.currentUserId;
    if (!userId) return 'Usuario';

    const otherName =
      Number(userId) === Number(conversation.buyer_id)
        ? conversation.seller_name
        : conversation.buyer_name;

    return otherName?.trim() || 'Usuario';
  }

  getDisplayPartnerName(conversation: ConversationInbox): string {
    const name = this.getOtherParticipantName(conversation);
    return name !== 'Usuario' ? name : 'Usuario';
  }

  isOwnMessage(message: ChatMessage): boolean {
    return Number(message.sender_id) === Number(this.currentUserId);
  }

  selectConversation(conversationId: number): void {
    this.router.navigate(['/messages', conversationId]);
  }

  sendMessage(): void {
    const content = this.newMessage.trim();
    const conversationId = this.activeConversationId();
    const user = this.auth.currentUser();

    if (!content || !conversationId || !user?.id) return;

    this.sending.set(true);
    this.errorMessage.set('');

    this.socketService.sendPrivateMessage({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    });

    this.newMessage = '';
    this.sending.set(false);
    this.cdr.detectChanges();
  }

  private loadInbox(): void {
    const token = this.auth.currentUser()?.token;
    if (!token) {
      this.router.navigate(['/']);
      return;
    }

    this.loadingInbox.set(true);
    this.errorMessage.set('');

    this.conversationService.getInbox(token).subscribe({
      next: (conversations) => {
        this.inbox.set(conversations);
        this.loadingInbox.set(false);
        this.enrichMissingPartnerNames(conversations);

        const activeId = this.activeConversationId();
        if (activeId) {
          this.resolveChatContext(activeId);
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la bandeja de mensajes.');
        this.loadingInbox.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  private openConversation(conversationId: number): void {
    const token = this.auth.currentUser()?.token;
    if (!token) {
      this.router.navigate(['/']);
      return;
    }

    this.activeConversationId.set(conversationId);
    this.resolveChatContext(conversationId);
    this.loadingMessages.set(true);
    this.errorMessage.set('');
    this.messages.set([]);

    this.socketService.offNewMessage(this.onNewMessage);

    this.messageService.getHistory(conversationId, token).subscribe({
      next: (history) => {
        this.messages.set(history);
        this.loadingMessages.set(false);

        this.socketService.connect();
        this.socketService.joinChat(conversationId);
        this.socketService.onNewMessage(this.onNewMessage);

        this.resolveChatContext(conversationId);
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el historial del chat.');
        this.loadingMessages.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  private resolveChatContext(conversationId: number): void {
    const fromInbox = this.getActiveConversation();
    const navContext = this.navigationState?.['chatContext'] as ChatContext | undefined;

    let context: ChatContext = {
      partnerName: navContext?.partnerName?.trim() || 'Usuario',
      articleTitle: navContext?.articleTitle?.trim() || 'Artículo',
      articlePrice: navContext?.articlePrice,
      partnerId: navContext?.partnerId,
    };

    if (fromInbox) {
      const partnerName = this.getOtherParticipantName(fromInbox);
      const partnerId = this.getOtherParticipantId(fromInbox);

      context = {
        partnerName: partnerName !== 'Usuario' ? partnerName : context.partnerName,
        articleTitle: fromInbox.article_title || context.articleTitle,
        articlePrice: fromInbox.article_price ?? context.articlePrice,
        partnerId: partnerId || context.partnerId,
      };
    }

    this.activeChatContext.set(context);

    if (!context.partnerName || context.partnerName === 'Usuario') {
      const partnerId =
        context.partnerId ??
        (fromInbox ? this.getOtherParticipantId(fromInbox) : undefined);

      if (partnerId) {
        this.fetchPartnerName(partnerId, conversationId);
      }
    }
  }

  private enrichMissingPartnerNames(conversations: ConversationInbox[]): void {
    for (const conversation of conversations) {
      if (this.getOtherParticipantName(conversation) !== 'Usuario') continue;

      const partnerId = this.getOtherParticipantId(conversation);
      this.fetchPartnerName(partnerId, conversation.conversation_id);
    }
  }

  private fetchPartnerName(userId: number, conversationId: number): void {
    this.userService.getById(userId).subscribe({
      next: (user) => {
        const name = user.username?.trim() || user.email?.trim() || 'Usuario';

        this.partnerNames.update((current) => ({
          ...current,
          [conversationId]: name,
        }));

        if (Number(this.activeConversationId()) === Number(conversationId)) {
          this.activeChatContext.update((context) =>
            context ? { ...context, partnerName: name, partnerId: userId } : context,
          );
        }

        this.cdr.detectChanges();
      },
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }
}
