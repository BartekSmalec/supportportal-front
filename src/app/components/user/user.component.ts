import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { Role } from 'src/app/enum/role.enum';
import { CustomHttpResponse } from 'src/app/model/CustomHttpResponse';
import { FileUploadStatus } from 'src/app/model/file-upload.status';
import { User } from 'src/app/model/user';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { NotificationService } from 'src/app/service/notification.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {

  user: User;
  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public users: User[];
  refreshing: boolean;
  private subscriptions: Subscription[] = [];
  selectedUser: User;
  editUser = new User();
  fileName: string;
  profileImage: File;
  currenUsername: string;
  //isAdmin = true;
  fileStatus = new FileUploadStatus();

  constructor(private router: Router, private authService: AuthenticationService, private userService: UserService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.user = this.authService.getUserFromLocalStorage();
    }
    this.getUsers(true);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public changleTile(title: string): void {
    this.titleSubject.next(title);
  }

  updateProfileImage() {
    document.getElementById('profile-image-input').click();
  }

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isManager(): boolean {
    return this.isAdmin || this.getUserRole() === Role.MANAGER;
  }

  private getUserRole(): string {
    return this.authService.getUserFromLocalStorage().role;
  }

  public getUsers(showNotification: boolean): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.getUsers().subscribe(
        (response: User[]) => {
          this.users = response;
          this.userService.addUsersToLocalCache(response)
          console.log("Response: " + JSON.stringify(response))
          this.refreshing = false;
          if (showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${response.length} user(s) loaded successfully.`);
          }
        },
        (errorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    );
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.showNotification(notificationType, message);
    } else {
      this.notificationService.showNotification(notificationType, 'An error occurred. Please try again.');
    }
  }

  public onSelectUser(selectedUser: User): void {
    this.selectedUser = selectedUser;
    document.getElementById('openUserInfo').click();
  }

  public onSelectEditUser(editUser: User) {
    this.editUser = editUser;
    this.currenUsername = editUser.username;

    console.log(JSON.stringify(this.editUser));

    document.getElementById('editUserButton').click()
  }

  public onProfileImageChange(fileName: string, image: File): void {
    this.fileName = fileName;
    this.profileImage = image;
  }

  public saveNewUser(): void {
    document.getElementById('new-user-save').click();
  }


  public editCurrentUser(): void {
    document.getElementById('user-edit-button').click();
  }
  
  public onUpdateUser(editForm: NgForm): void {
    const formData = this.userService.createUserFormData(this.currenUsername, this.editUser, this.profileImage);
    this.subscriptions.push(this.userService.updateUser(formData).subscribe(
      (response: User) => {
        this.getUsers(true);
        document.getElementById('user-edit-close').click();
  
        this.fileName = null;
        this.profileImage = null;


        this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} updated succesfully`);
        editForm.reset();
      },
      (errorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
      }
    ));
  }

  public onAddNewUser(userForm: NgForm): void {
    const formData = this.userService.createUserFormData(null, userForm.value, this.profileImage);
    this.subscriptions.push(this.userService.addUser(formData).subscribe(
      (response: User) => {
        document.getElementById('new-user-close').click();
        this.getUsers(false);
        this.fileName = null;
        this.profileImage = null;
        userForm.reset();
        this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} created succesfully`);

      },
      (errorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
      }
    ));
  }

  public searchUsers(searchTerm: string): void {
    const results: User[] = [];
    for (const user of this.userService.getUsersFromLocalCache()) {
      if (user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
        results.push(user);
      }
    }
    this.users = results;
    if (results.length === 0 || !searchTerm) {
      this.users = this.userService.getUsersFromLocalCache();
    }
  }

  public onDeleteUser(username: string) {
    this.subscriptions.push(this.userService.deleteUser(username).subscribe(
      (response: CustomHttpResponse) => {

        this.sendNotification(NotificationType.SUCCESS, response.message);
        this.getUsers(true);

      },
      (errorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
      }
    ));
  }

  public onResetPassword(emailForm: NgForm): void {
    this.refreshing = true;
    const emailAddress = emailForm.value['reset-password-email']
    this.subscriptions.push(
      this.userService.resetPassword(emailAddress).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;

        },
        () => emailForm.reset()
      )
    )
  }

  public onUpdateCurrentUser(user: User): void {
    this.refreshing = true;
    console.log(JSON.stringify(user))
    this.currenUsername = this.authService.getUserFromLocalStorage().username;
    const formData = this.userService.createUserFormData(this.currenUsername, user, this.profileImage);
    this.subscriptions.push(this.userService.updateUser(formData).subscribe(
      (response: User) => {
        this.authService.addUserToLocalStorage(response);
        this.getUsers(false);
        this.fileName = null;
        this.profileImage = null;
        this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} updated succesfully`);

      },
      (errorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.profileImage = null;
        this.refreshing = false;
      }
    ));
  }

  public onLogOut(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.sendNotification(NotificationType.SUCCESS, `You've been successfully logged out`);
  }

  public onUpdateProfileImage(): void {
    const formData = new FormData();
    formData.append('username', this.user.username);
    formData.append('profileImage', this.profileImage);

    this.subscriptions.push(this.userService.updateProfileImage(formData).subscribe(
      (event: HttpEvent<any>) => {
        this.reportUploadProgress(event);


      },
      (errorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.fileStatus.status = 'done';

      }
    ));
  }
  reportUploadProgress(event: HttpEvent<any>): void {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        this.fileStatus.percentage = Math.round(event.loaded / event.total * 100);
        this.fileStatus.status = 'progress';
        break;
      case HttpEventType.Response:
        if (event.status === 201) {
          this.user.profileImageUrl = `${event.body.profileImageUrl}?time=${new Date().getTime()}`
          this.sendNotification(NotificationType.SUCCESS, `${event.body.firstName} \'s profile image updated successfully`);
          this.fileStatus.status = 'done';

          this.authService.addUserToLocalStorage(this.user);

          break;
        } else {
          this.sendNotification(NotificationType.ERROR, `Unable to load image. Try again`);
          break;
        }
      default:
        `Finished all processes`;

    }
  }


}
