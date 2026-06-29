import { Component, OnInit, inject } from '@angular/core';
import { ModeradorService } from '../../services/moderadorService';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

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


  tab: 'articles' | 'usuarios' | 'historico' = 'articles';

  reportesArticulos: any[] = [];
  reportesUsuarios: any[] = [];
  historico: any[] = [];
  isModerador = false;
  articulosAgrupados: any[] = [];
  usuariosAgrupados: any[] = [];
  token = '';
  loadingArticles = true;
  loadingUsers = true;
  loadingHistorico = true;


  ngOnInit(): void {
const user = JSON.parse(localStorage.getItem('user') || '{}');
this.isModerador = user.role === 'Moderador';
this.token = user.token || ''

  if (this.isModerador) {
    this.cargarDatos();
  }
  
  
console.log('ROLE:', user.role);
console.log('TOKEN:', this.token);

if (!this.token) {
  this.mostrarMensaje('Sesión inválida, vuelve a iniciar sesión');
  return;
}

  }
 
  cargarDatos(): void {
    this.loadingArticles = true;
    this.loadingUsers = true;
    this.loadingHistorico = true;
  
    this.moderadorService.getReportesArticulos(this.token).subscribe({
      next: (data) => {
        const reportes = this.normalizarReportesArticulos(data);
        this.reportesArticulos = reportes;
        this.articulosAgrupados = this.agruparPorArticulo(reportes);
        this.loadingArticles = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar reportes de artículos');
        this.loadingArticles = false;
      }
    });
  
    this.moderadorService.getReportesUsuarios(this.token).subscribe({
      next: (data) => {
        const reportes = this.normalizarReportesUsuarios(data);
        this.reportesUsuarios = reportes;
        this.usuariosAgrupados = this.agruparPorUsuario(reportes);
        this.loadingUsers = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar reportes de usuarios');
        this.loadingUsers = false;
      }
    });
  
    this.moderadorService.getHistorico(this.token).subscribe({
      next: (data: any) => {
        this.historico = Array.isArray(data) ? data : (data?.results || []);
        this.loadingHistorico = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar histórico');
        this.loadingHistorico = false;
      }
    });
  }

  agruparPorArticulo(reportes: any[]): any[] {
    if (!Array.isArray(reportes)) return [];
  
    const mapa = new Map<number, any>();
  
    reportes.forEach((reporte) => {
      const articuloId = reporte.articuloId;
  
      if (!articuloId) {
        console.warn('Reporte de artículo sin articuloId:', reporte);
        return;
      }
  
      if (!mapa.has(articuloId)) {
        mapa.set(articuloId, {
          targetId: articuloId,
          titulo: reporte.titulo || `Artículo ${articuloId}`,
          totalReportes: 0,
          motivos: [],
          reportIds: []
        });
      }
  
      const grupo = mapa.get(articuloId);
  
      grupo.totalReportes++;
      grupo.reportIds.push(reporte.id);
  
      if (reporte.motivo && !grupo.motivos.includes(reporte.motivo)) {
        grupo.motivos.push(reporte.motivo);
      }
    });
  
    return Array.from(mapa.values()).sort((a, b) => b.totalReportes - a.totalReportes);
  }  

  agruparPorUsuario(reportes: any[]): any[] {
    if (!Array.isArray(reportes)) return [];
  
    const mapa = new Map<number, any>();
  
    reportes.forEach((reporte) => {
      const usuarioId = reporte.usuarioId;
  
      if (!usuarioId) {
        console.warn('Reporte de usuario sin usuarioId:', reporte);
        return;
      }
  
      if (!mapa.has(usuarioId)) {
        mapa.set(usuarioId, {
          targetId: usuarioId,
          nombre: reporte.nombre || `Usuario ${usuarioId}`,
          totalReportes: 0,
          motivos: [],
          reportIds: []
        });
      }
  
      const grupo = mapa.get(usuarioId);
  
      grupo.totalReportes++;
      grupo.reportIds.push(reporte.id);
  
      if (reporte.motivo && !grupo.motivos.includes(reporte.motivo)) {
        grupo.motivos.push(reporte.motivo);
      }
    });
  
    return Array.from(mapa.values()).sort((a, b) => b.totalReportes - a.totalReportes);
  }

  observarArticulo(grupo: any): void {
    this.router.navigate(['/articles', grupo.targetId]);
  }

  accionGrupo(
    tipo: 'eliminar' | 'aceptar' | 'rechazar' | 'suspender',
    grupo: any
  ): void {
  
    let mensaje = '';
  
    switch (tipo) {
      case 'eliminar':
        mensaje = `Artículo eliminado (${grupo.totalReportes} reportes)`;
        break;
  
      case 'aceptar':
        mensaje = `Reportes aceptados (${grupo.totalReportes})`;
        break;
  
      case 'rechazar':
        mensaje = `Reportes rechazados`;
        break;
  
      case 'suspender':
        mensaje = `Usuario suspendido`;
        break;
    }
  
    this.mostrarMensaje(mensaje);
  }

  eliminarArticulo(grupo: any): void {
    this.moderadorService
      .eliminarArticulo(grupo.targetId, this.token)
      .subscribe({
        next: () => {
          this.articulosAgrupados =
            this.articulosAgrupados.filter(a => a.targetId !== grupo.targetId);
  
          this.mostrarMensaje('Artículo eliminado correctamente');
        },
        error: (err) => {
          console.error(err);
          this.mostrarMensaje('Error al eliminar artículo');
        }
      });
  }
  
  
  aceptarGrupo(grupo: any): void {
    this.mostrarMensaje(`Reportes aceptados (${grupo.totalReportes})`);
  }
  
  rechazarGrupo(grupo: any): void {
    this.mostrarMensaje(`Reportes rechazados`);
  }
  
  suspenderUsuario(grupo: any): void {
    this.moderadorService
      .suspenderUsuario(grupo.targetId, this.token)
      .subscribe({
        next: () => {
  
          this.usuariosAgrupados =
            this.usuariosAgrupados.filter(u => u.targetId !== grupo.targetId);
  
          this.mostrarMensaje('Usuario suspendido correctamente');
        },
        error: (err) => {
          console.error(err);
          this.mostrarMensaje('Error al suspender usuario');
        }
      });
  }

  mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  normalizarReportesArticulos(data: any): any[] {
    const reportes = Array.isArray(data) ? data : data?.results || [];
  
    return reportes.map((item: any) => ({
      id: item.report_id,
      motivo: item.report_reason,
      fecha: item.report_created_at,
      articuloId: item.article_id || item.articulo_id || item.article?.id || item.articleId,
      titulo: item.title || item.titulo || item.article_title
    }));
  }
  
  normalizarReportesUsuarios(data: any): any[] {
    const reportes = Array.isArray(data) ? data : data?.results || [];
  
    return reportes.map((item: any) => ({
      id: item.report_id,
      motivo: item.report_reason,
      fecha: item.report_created_at,
      usuarioId: item.user_id || item.usuario_id || item.reported_user_id || item.usuarioId,
      nombre: item.username || item.name || item.nombre
    }));
  }
}