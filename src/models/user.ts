
export class User {

    username: String;
    email: String;
    password: String;
    id: string;

    constructor(jsonObject:any){
        this.username = jsonObject.username;
        this.email = jsonObject.email;
        this.password = jsonObject.password;
        if(jsonObject._id == '' || jsonObject._id == undefined || jsonObject._id == null){
            this.id = jsonObject.id;
        } else {
            this.id = jsonObject._id;
        }
        
    }
}
