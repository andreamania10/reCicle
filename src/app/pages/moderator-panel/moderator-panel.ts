import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { ModeradorService } from '../../services/moderadorService';
import {
  Report,
  ApiListResponse,
  GrupoArticulo,
  GrupoUsuario
} from '../../interfaces/report';

@Component({
  selector: 'app-moderator-panel',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './moderator-panel.html',
  styleUrls: ['./moderator-panel.css']
})
export class ModeratorPanel implements OnInit {
  private router = inject(Router);
  private moderadorService = inject(ModeradorService);
  private snackBar = inject(MatSnackBar);

  tab: 'articles' | 'usuarios' = 'articles';

  articulosAgrupados: GrupoArticulo[] = [];
  usuariosAgrupados: GrupoUsuario[] = [];

  isModerador = false;
  token = '';

  loadingArticles = true;
  loadingUsers = true;

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.role || '';

    this.isModerador = [
      'Moderador',
      'ROLE_MODERATOR',
      'Administrador',
      'ROLE_ADMIN'
    ].includes(role);

    this.token = user?.token || '';

    if (!this.token) {
      this.mostrarMensaje('Sesión inválida, vuelve a iniciar sesión');
      return;
    }

    if (!this.isModerador) {
      this.mostrarMensaje('No tienes permisos');
      return;
    }

    this.cargarDatos();
  }

  /* =========================
     NORMALIZACIÓN
     ========================= */

  private extractList<T>(data: ApiListResponse<T>): T[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.reports)) return data.reports;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }

  private getMotivos(item: Report): string[] {
    const motivosArray = Array.isArray(item.motivos) ? item.motivos : [];
    const motivoSimple = item.report_reason ?? item.reason ?? item.motivo;

    const motivos = [...motivosArray];
    if (motivoSimple) {
      motivos.push(motivoSimple);
    }

    return [...new Set(motivos.filter((m): m is string => Boolean(m)))];
  }

  private getReportIds(item: Report): number[] {
    const idsArray = Array.isArray(item.reportIds) ? item.reportIds : [];
    const idSimple = item.report_id ?? item.id ?? item.reportId;

    const ids = [...idsArray];
    if (idSimple != null) {
      ids.push(idSimple);
    }

    return [...new Set(ids.filter((id): id is number => id != null))];
  }

  private getTotal(item: Report): number {
    return (
      item.totalReportes ??
      item.reportsCount ??
      item.total_reports ??
      (this.getReportIds(item).length || 1)
    );
  }

  /* =========================
     MAPEO
     ========================= */

  private mapToArticulo(item: Report): GrupoArticulo | null {
    const targetId =
      item.article_id ??
      item.articulo_id ??
      item.articleId ??
      item.reported_article_id ??
      item.target_id ??
      item.targetId ??
      item.article?.id;

    if (targetId == null) return null;

    return {
      targetId,
      titulo:
        item.title ??
        item.titulo ??
        item.article_title ??
        item.article?.title ??
        item.article?.titulo ??
        `Artículo #${targetId}`,
      totalReportes: this.getTotal(item),
      motivos: this.getMotivos(item),
      reportIds: this.getReportIds(item)
    };
  }

  private mapToUsuario(item: Report): GrupoUsuario | null {
    const targetId =
      item.user_id ??
      item.usuario_id ??
      item.reported_user_id ??
      item.target_id ??
      item.targetId ??
      item.user?.id ??
      item.usuario?.id;

    if (targetId == null) return null;

    return {
      targetId,
      nombre:
        item.username ??
        item.name ??
        item.nombre ??
        item.user?.username ??
        item.user?.name ??
        item.user?.nombre ??
        item.usuario?.username ??
        item.usuario?.name ??
        item.usuario?.nombre ??
        `Usuario #${targetId}`,
      totalReportes: this.getTotal(item),
      motivos: this.getMotivos(item),
      reportIds: this.getReportIds(item)
    };
  }

  /* =========================
     AGRUPACIÓN
     ========================= */

  private agruparArticulos(items: Report[]): GrupoArticulo[] {
    const map = new Map<number, GrupoArticulo>();

    items.forEach((item) => {
      const grupo = this.mapToArticulo(item);
      if (!grupo) return;

      if (!map.has(grupo.targetId)) {
        map.set(grupo.targetId, {
          targetId: grupo.targetId,
          titulo: grupo.titulo,
          totalReportes: 0,
          motivos: [],
          reportIds: []
        });
      }

      const actual = map.get(grupo.targetId)!;

      actual.totalReportes += grupo.totalReportes;
      actual.reportIds.push(...grupo.reportIds);

      grupo.motivos.forEach((motivo) => {
        if (!actual.motivos.includes(motivo)) {
          actual.motivos.push(motivo);
        }
      });

      actual.reportIds = [...new Set(actual.reportIds)];
    });

    return Array.from(map.values()).sort(
      (a, b) => b.totalReportes - a.totalReportes
    );
  }

  private agruparUsuarios(items: Report[]): GrupoUsuario[] {
    const map = new Map<number, GrupoUsuario>();

    items.forEach((item) => {
      const grupo = this.mapToUsuario(item);
      if (!grupo) return;

      if (!map.has(grupo.targetId)) {
        map.set(grupo.targetId, {
          targetId: grupo.targetId,
          nombre: grupo.nombre,
          totalReportes: 0,
          motivos: [],
          reportIds: []
        });
      }

      const actual = map.get(grupo.targetId)!;

      actual.totalReportes += grupo.totalReportes;
      actual.reportIds.push(...grupo.reportIds);

      grupo.motivos.forEach((motivo) => {
        if (!actual.motivos.includes(motivo)) {
          actual.motivos.push(motivo);
        }
      });

      actual.reportIds = [...new Set(actual.reportIds)];
    });

    return Array.from(map.values()).sort(
      (a, b) => b.totalReportes - a.totalReportes
    );
  }

  /* =========================
     CARGA
     ========================= */

  cargarDatos(): void {
    this.loadingArticles = true;
    this.loadingUsers = true;

    this.moderadorService.getReportesArticulos(this.token).subscribe({
      next: (data: ApiListResponse<Report>) => {
        const list = this.extractList(data);
        this.articulosAgrupados = this.agruparArticulos(list);
        this.loadingArticles = false;
      },
      error: (err) => {
        console.error('Error al cargar artículos:', err);
        this.mostrarMensaje('Error al cargar artículos');
        this.loadingArticles = false;
      }
    });

    this.moderadorService.getReportesUsuarios(this.token).subscribe({
      next: (data: ApiListResponse<Report>) => {
        const list = this.extractList(data);
        this.usuariosAgrupados = this.agruparUsuarios(list);
        this.loadingUsers = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.mostrarMensaje('Error al cargar usuarios');
        this.loadingUsers = false;
      }
    });
  }

  /* =========================
     ACCIONES ARTÍCULOS
     ========================= */

  observarArticulo(grupo: GrupoArticulo): void {
    this.router.navigate(['/articles', grupo.targetId]);
  }

  aceptarGrupo(grupo: GrupoArticulo): void {
    if (!grupo.reportIds.length) {
      this.mostrarMensaje('No hay reportes para aprobar');
      return;
    }

    const calls = grupo.reportIds.map((id) =>
      this.moderadorService.resolverReporte(id, 'accept', this.token)
    );

    forkJoin(calls).subscribe({
      next: () => {
        this.articulosAgrupados = this.articulosAgrupados.filter(
          (a) => a.targetId !== grupo.targetId
        );
        this.mostrarMensaje('Reportes aprobados');
      },
      error: (err) => {
        console.error('Error al aprobar reportes:', err);
        this.mostrarMensaje('Error al aprobar');
      }
    });
  }

  rechazarGrupo(grupo: GrupoArticulo): void {
    if (!grupo.reportIds.length) {
      this.mostrarMensaje('No hay reportes para rechazar');
      return;
    }

    const calls = grupo.reportIds.map((id) =>
      this.moderadorService.resolverReporte(id, 'reject', this.token)
    );

    forkJoin(calls).subscribe({
      next: () => {
        this.articulosAgrupados = this.articulosAgrupados.filter(
          (a) => a.targetId !== grupo.targetId
        );
        this.mostrarMensaje('Reportes rechazados');
      },
      error: (err) => {
        console.error('Error al rechazar reportes:', err);
        this.mostrarMensaje('Error al rechazar');
      }
    });
  }

  /* =========================
     UI
     ========================= */

  mostrarMensaje(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}