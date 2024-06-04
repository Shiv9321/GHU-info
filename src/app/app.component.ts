import { ApiService } from './services/api.service';
import {  Component, OnInit,} from "@angular/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {ngSkipHydration: 'true'},
})

export class AppComponent implements OnInit
{

  title = 'ghu-info';

  constructor
  (
    private apiService: ApiService
  ) {}

  showPopup = true;

  ngOnInit()
  {
    setTimeout(() =>
    {
      this.closePopup();
    }, 2000);
  }

  closePopup()
  {
    this.showPopup = false;
  }

}
