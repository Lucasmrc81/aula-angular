import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SPECIES_IMAGE_MAP } from '../../data/species-image-map';

@Component({
  selector: 'app-especies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './especies.component.html',
  styleUrls: ['./especies.component.scss'],
})
export class EspeciesComponent {
  defaultImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect fill="%23000000" width="400" height="240"/></svg>';

  especies = Array.from({ length: 12 }).map((_, i) => {
    const name =
      ['Human', 'Wookiee', 'Droid', "Twi'lek", 'Rodian', 'Hutt'][i % 6] +
      ' ' +
      (i + 1);

    const classification = [
      'mammal',
      'species',
      'artificial',
      'mammal',
      'reptilian',
      'gastropod',
    ][i % 6];

    const language = [
      'Basic',
      'Shyriiwook',
      'Binary',
      'Ryl',
      'Rodese',
      'Huttese',
    ][i % 6];

    // tenta mapear o nome para um arquivo em /assets/especie
    const image = SPECIES_IMAGE_MAP[name] || this.defaultImage;

    return { name, classification, language, image };
  });

  selectedSpecies: any = null;

  openPanel(species: any) {
    this.selectedSpecies = species;
  }

  closePanel() {
    this.selectedSpecies = null;
  }
}
