import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Member {
  name: string;
  role: string;
  joined: number;
  avatar: string;
  bio: string;
}

interface Post {
  author: string;
  avatar: string;
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-comunidade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunidade.component.html',
  styleUrls: ['./comunidade.component.scss'],
})
export class ComunidadeComponent {
  members: Member[] = [
    {
      name: 'Leia Organa',
      role: 'Moderadora',
      joined: 2020,
      avatar:
        'https://vignette.wikia.nocookie.net/starwars/images/5/5c/Leia_Organa_TLJ.png',
      bio: 'Sempre pronta para manter a ordem na comunidade.',
    },
    {
      name: 'Han Solo',
      role: 'Membro',
      joined: 2021,
      avatar:
        'https://vignette.wikia.nocookie.net/starwars/images/6/60/Han_Solo_TLJ.png',
      bio: 'Aventureiro e rápido nas respostas.',
    },
    {
      name: 'Luke Skywalker',
      role: 'Membro',
      joined: 2019,
      avatar:
        'https://vignette.wikia.nocookie.net/starwars/images/2/20/LukeTLJ.jpg',
      bio: 'Sempre ajuda iniciantes a aprenderem sobre a Força.',
    },
  ];

  posts: Post[] = [];
  newMessage: string = '';

  addPost() {
    if (!this.newMessage.trim()) return;
    this.posts.unshift({
      author: 'Luke Skywalker',
      avatar:
        'https://vignette.wikia.nocookie.net/starwars/images/2/20/LukeTLJ.jpg',
      message: this.newMessage,
      timestamp: new Date(),
    });
    this.newMessage = '';
  }
}
