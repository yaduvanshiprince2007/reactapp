export interface UserSignUp {
    firstName: string;
    middleName?: string;
    lastName: string;
    age: number;
    gender: number;
    // code: string;
    mobile: string;
    email: string;
    dob: Date;
    // createdOn: Date;
    // modifiedOn: Date;
    profilePic?: string;
    password: string;
    confirmPassword:string;
    address:string;
}

export interface UserLogIn{
    userId:string;
    password:string;
}

export interface Token{
    created:string | number;
    exp:string | number;
    accessToken:JWTDetail;
}

export interface JWTDetail{
    firstName:string;
    middleName:string;
    lastName:string;
    fullName:string;
    age:number;
    gender:string;
    mobile:string;
    email:string;
    dob:string;
    profilePic:string;
    address:string;
    roles:number[];
}
