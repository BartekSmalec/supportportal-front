import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { JwtHelperService, JwtModule } from "@auth0/angular-jwt";
import { CustomHttpResponse } from '../model/CustomHttpResponse';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private host: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/user/list`);
  }


  public addUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/add`, formData);
  }

  public updateUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/update`, formData);
  }

  public resetPassword(email: String): Observable<CustomHttpResponse> {
    return this.http.get<CustomHttpResponse>(`${this.host}/user/resetPassword/${email}`);
  }

  public updateProfileImage(formData: FormData): Observable<HttpEvent<User>> {
    return this.http.post<User>(`${this.host}/user/updateProfileImage`, formData,
      {
        reportProgress: true,
        observe: 'events'
      });
  }

  public deleteUser(id: Number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.host}/user/delete/${id}`);
  }

  public addUsersToLocalCache(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  public getUsersFromLocalCache(): User[] {
    if (localStorage.getItem('users')) {
      return JSON.parse(localStorage.getItem('users'));
    }
    return null;
  }
  
  public createUserFormData(currentUsername: string, user: User, profileImage: File): FormData {
    const formData = new FormData();
    formData.append('currentUsername', currentUsername);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('role', user.role);
    formData.append('isActive', JSON.stringify(user.active));
    formData.append('nonLocked', JSON.stringify(user.nonLocked));
    formData.append('profileImage', profileImage);
    return formData;
  }

}
