import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';

// Interface das estrelas
interface Star {
  x: number; // posição X
  y: number; // posição Y
  z: number; // profundidade
}

// Interface das naves
interface Ship {
  img: HTMLImageElement; // imagem da nave
  baseSize: number; // tamanho inicial
  size: number; // tamanho atual
  minSize: number; // tamanho mínimo antes de sumir
  visible: boolean; // se está visível
  xOffset: number; // deslocamento horizontal
  yOffset: number; // deslocamento vertical
  direction: 1 | -1; // 1 = esquerda->centro, -1 = direita->centro
}

@Component({
  standalone: true,
  selector: 'app-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss'],
})
export class PreloaderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('spaceCanvas') canvasRef!: ElementRef<HTMLCanvasElement>; // referência do canvas

  private stars: Star[] = []; // array de estrelas
  private starCount = 400; // quantidade de estrelas
  private starSizeMultiplier = 3; // fator de tamanho
  private maxDepth = 1000; // profundidade máxima
  private starSpeed = 1.2; // velocidade inicial
  private starSpeedMultiplier = 1.02; // aceleração

  private ships: Ship[] = []; // array de naves

  private logo = new Image(); // imagem do logo
  private logoVisible = false; // se o logo carregou
  private logoScale = 0; // escala inicial
  private logoTargetScale = 1; // escala final
  private logoGrowRate = 0.03; // velocidade de crescimento do logo

  private canvas!: HTMLCanvasElement; // referência ao canvas
  private ctx!: CanvasRenderingContext2D; // contexto 2D
  private rafId = 0; // ID do requestAnimationFrame
  private onResizeBound = () => this.resizeCanvas(); // bind do resize

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement; // pega canvas
    const ctx = this.canvas.getContext('2d'); // pega contexto 2D
    if (!ctx) return;
    this.ctx = ctx;

    this.resizeCanvas();
    window.addEventListener('resize', this.onResizeBound);

    this.maxDepth = Math.max(window.innerWidth, window.innerHeight) * 1.2;

    for (let i = 0; i < this.starCount; i++) this.stars.push(this.randomStar());

    const s1: Ship = {
      img: new Image(),
      baseSize: 280,
      size: 280,
      minSize: 20,
      visible: false,
      xOffset: -window.innerWidth / 2,
      yOffset: 0,
      direction: 1,
    };
    s1.img.src = 'assets/nave1.png';
    s1.img.onload = () => (s1.visible = true);

    const s2: Ship = {
      img: new Image(),
      baseSize: 280,
      size: 280,
      minSize: 20,
      visible: false,
      xOffset: window.innerWidth / 2,
      yOffset: 0,
      direction: -1,
    };
    s2.img.src = 'assets/nave2.png';
    s2.img.onload = () => (s2.visible = true);

    this.ships.push(s1, s2);

    this.logo.src = 'assets/logo.png';
    this.logo.onload = () => (this.logoVisible = true);

    this.rafId = requestAnimationFrame(() => this.animate());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId); // cancela animação
    window.removeEventListener('resize', this.onResizeBound);
  }

  private animate() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    for (let s of this.stars) {
      s.z -= this.starSpeed;
      if (s.z <= 1) Object.assign(s, this.randomStar(), { z: this.maxDepth }); // reinicia estrela
      const sx = (s.x / s.z) * cx + cx;
      const sy = (s.y / s.z) * cy + cy;
      const size = (1 - s.z / this.maxDepth) * this.starSizeMultiplier;
      if (
        sx >= -50 &&
        sx <= canvas.width + 50 &&
        sy >= -50 &&
        sy <= canvas.height + 50 &&
        size > 0
      ) {
        ctx.fillRect(sx, sy, size, size);
      }
    }

    let shipsOnScreen = false;

    const leftShipLimit = cx - 150;
    const rightShipLimit = cx + 150;

    for (const ship of this.ships) {
      if (!ship.visible) continue;
      shipsOnScreen = true;

      if (ship.direction === 1) {
        // esquerda -> centro
        if (cx + ship.xOffset < leftShipLimit) {
          ship.xOffset += 5;
        } else {
          ship.visible = false;
        }
      } else {
        if (cx + ship.xOffset > rightShipLimit) {
          ship.xOffset -= 5;
        } else {
          ship.visible = false;
        }
      }

      ship.size *= 0.985;

      const drawX = cx + ship.xOffset - ship.size / 2;
      const drawY = cy + ship.yOffset - ship.size / 2;

      ctx.globalAlpha = Math.max(0.3, ship.size / ship.baseSize);
      ctx.drawImage(ship.img, drawX, drawY, ship.size, ship.size);
      ctx.globalAlpha = 1; // reseta alpha
    }

    if (!shipsOnScreen && this.logoVisible) {
      if (this.logoScale < this.logoTargetScale)
        this.logoScale += this.logoGrowRate;
      const logoSize = 180 + 100 * this.logoScale;
      ctx.globalAlpha = Math.min(1, this.logoScale);
      ctx.drawImage(
        this.logo,
        cx - logoSize / 2,
        cy - logoSize / 2,
        logoSize,
        logoSize
      ); // desenha logo
      ctx.globalAlpha = 1;
    }

    this.starSpeed *= this.starSpeedMultiplier;
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  private randomStar(): Star {
    return {
      x: (Math.random() - 0.5) * this.canvas.width,
      y: (Math.random() - 0.5) * this.canvas.height,
      z: Math.random() * this.maxDepth + 1,
    };
  }

  private resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.maxDepth = Math.max(window.innerWidth, window.innerHeight) * 1.2;
  }
}
