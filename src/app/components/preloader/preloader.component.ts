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

    this.resizeCanvas(); // ajusta canvas à tela
    window.addEventListener('resize', this.onResizeBound); // adiciona listener resize

    this.maxDepth = Math.max(window.innerWidth, window.innerHeight) * 1.2; // ajusta profundidade

    // Inicializa estrelas
    for (let i = 0; i < this.starCount; i++) this.stars.push(this.randomStar());

    // Nave da esquerda
    const s1: Ship = {
      img: new Image(),
      baseSize: 280,
      size: 280,
      minSize: 20,
      visible: false,
      xOffset: -window.innerWidth / 2, // inicia fora da tela à esquerda
      yOffset: 0, // altura central
      direction: 1, // direção para o centro
    };
    s1.img.src = 'assets/nave1.png';
    s1.img.onload = () => (s1.visible = true);

    // Nave da direita
    const s2: Ship = {
      img: new Image(),
      baseSize: 280,
      size: 280,
      minSize: 20,
      visible: false,
      xOffset: window.innerWidth / 2, // inicia fora da tela à direita
      yOffset: 0,
      direction: -1, // direção para o centro
    };
    s2.img.src = 'assets/nave2.png';
    s2.img.onload = () => (s2.visible = true);

    this.ships.push(s1, s2); // adiciona naves ao array

    // Carrega logo
    this.logo.src = 'assets/logo.png';
    this.logo.onload = () => (this.logoVisible = true);

    this.rafId = requestAnimationFrame(() => this.animate()); // inicia loop de animação
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId); // cancela animação
    window.removeEventListener('resize', this.onResizeBound); // remove listener resize
  }

  private animate() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Fundo preto
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha estrelas
    ctx.fillStyle = 'white';
    for (let s of this.stars) {
      s.z -= this.starSpeed; // move estrela
      if (s.z <= 1) Object.assign(s, this.randomStar(), { z: this.maxDepth }); // reinicia estrela
      const sx = (s.x / s.z) * cx + cx; // projeta X
      const sy = (s.y / s.z) * cy + cy; // projeta Y
      const size = (1 - s.z / this.maxDepth) * this.starSizeMultiplier; // calcula tamanho
      if (
        sx >= -50 &&
        sx <= canvas.width + 50 &&
        sy >= -50 &&
        sy <= canvas.height + 50 &&
        size > 0
      ) {
        ctx.fillRect(sx, sy, size, size); // desenha estrela
      }
    }

    let shipsOnScreen = false; // flag se alguma nave ainda visível

    // Limites individuais para desaparecer antes do centro
    const leftShipLimit = cx - 150; // nave da esquerda
    const rightShipLimit = cx + 150; // nave da direita

    // Loop das naves
    for (const ship of this.ships) {
      if (!ship.visible) continue; // ignora invisível
      shipsOnScreen = true;

      // Movimento horizontal com limite individual
      if (ship.direction === 1) {
        // esquerda -> centro
        if (cx + ship.xOffset < leftShipLimit) {
          ship.xOffset += 5; // move para o centro
        } else {
          ship.visible = false; // some antes do limite
        }
      } else {
        // direita -> centro
        if (cx + ship.xOffset > rightShipLimit) {
          ship.xOffset -= 5; // move para o centro
        } else {
          ship.visible = false; // some antes do limite
        }
      }

      ship.size *= 0.985; // diminui tamanho

      // Calcula posição para desenhar
      const drawX = cx + ship.xOffset - ship.size / 2;
      const drawY = cy + ship.yOffset - ship.size / 2;

      // Desenha a nave
      ctx.globalAlpha = Math.max(0.3, ship.size / ship.baseSize);
      ctx.drawImage(ship.img, drawX, drawY, ship.size, ship.size);
      ctx.globalAlpha = 1; // reseta alpha
    }

    // Desenha logo após naves sumirem
    if (!shipsOnScreen && this.logoVisible) {
      if (this.logoScale < this.logoTargetScale)
        this.logoScale += this.logoGrowRate; // aumenta escala
      const logoSize = 180 + 100 * this.logoScale; // tamanho do logo
      ctx.globalAlpha = Math.min(1, this.logoScale); // fade in
      ctx.drawImage(
        this.logo,
        cx - logoSize / 2,
        cy - logoSize / 2,
        logoSize,
        logoSize
      ); // desenha logo
      ctx.globalAlpha = 1; // reseta alpha
    }

    this.starSpeed *= this.starSpeedMultiplier; // acelera estrelas
    this.rafId = requestAnimationFrame(() => this.animate()); // loop animação
  }

  // Gera estrela aleatória
  private randomStar(): Star {
    return {
      x: (Math.random() - 0.5) * this.canvas.width,
      y: (Math.random() - 0.5) * this.canvas.height,
      z: Math.random() * this.maxDepth + 1,
    };
  }

  // Ajusta canvas ao tamanho da tela
  private resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.maxDepth = Math.max(window.innerWidth, window.innerHeight) * 1.2;
  }
}
