import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/model/user';
import { AuthenticationService } from 'src/app/service/authentication.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
  user: User;
  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();

  constructor(private authService: AuthenticationService) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.user = this.authService.getUserFromLocalStorage();
    }
  }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  public changleTile(title: string): void{
    this.titleSubject.next(title);
  }

}
