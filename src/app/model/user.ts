export class User{
    public id: number;
    public userId: string;
    public firstName: string;
    public lastName: string;
    public username: string;
    public email: string;
    public lastLoginDate: Date;
    public lastLoginDateDisplay: Date;
    public joinDate: Date;
    public profileImageUrl: string;
    public active: boolean;
    public isNonLocked: boolean;
    public role: string;
    public authorities: [];

    constructor(){
        this.userId = '';
        this.firstName = '';
        this.lastName = '';
        this.username = '';
        this.email = '';
        this.lastLoginDate = null;
        this.lastLoginDateDisplay = null;
        this.joinDate = null;
        this.profileImageUrl = '';
        this.active = false;
        this.isNonLocked = false;
        this.role = '';
        this.authorities = [];  
    }

    
}