import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  title?: string;
  text: string;
  image?: string;
  images?: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  steps: Step[] = [
    {
      title: 'Bem-vindo ao Universo Star Wars!',
      text: `
A saga Star Wars construiu uma história épica desde 1977 até hoje,
inspirando filmes, séries, jogos e toda a cultura pop ao redor do mundo.
Explore o universo e descubra detalhes incríveis!`,
      image: 'assets/star-wars-history.webp',
    },
    {
      text: `Star Wars não é apenas um filme; é um fenômeno que transformou o cinema e
a cultura pop mundial. Desde sua estreia, inspirou gerações de fãs,
influenciou outros filmes, séries, livros e até jogos eletrônicos.`,
      image: 'assets/star-wars-poster.webp',
    },
    {
      title: 'Galeria Star Wars',
      text: `Algumas imagens icônicas do universo Star Wars!`,
      images: [
        'assets/jogo.webp',
        'assets/quadrinhos.webp',
        'assets/DarthVader.webp',
        'assets/imagemHistorica.webp',
      ],
    },
  ];

  currentStep = 0;

  ngOnInit() {
    this.resetSteps();
  }

  ngOnDestroy() {
    this.resetSteps();
  }

  nextStep() {
    this.currentStep = (this.currentStep + 1) % this.steps.length;
  }

  resetSteps() {
    this.currentStep = 0;
  }

  get currentText(): string {
    return this.steps[this.currentStep].text;
  }

  get currentImage(): string | undefined {
    return this.steps[this.currentStep].image;
  }

  get currentImages(): string[] | undefined {
    return this.steps[this.currentStep].images;
  }

  get currentTitle(): string | undefined {
    return this.steps[this.currentStep].title;
  }

  get isGallery(): boolean {
    return Array.isArray(this.currentImages) && this.currentImages.length > 0;
  }

  imgClass(img: string): string {
    const portraitFiles = ['quadrinhos', 'jogo'];
    return portraitFiles.some((name) => img.includes(name))
      ? 'img-portrait'
      : 'img-landscape';
  }
}
