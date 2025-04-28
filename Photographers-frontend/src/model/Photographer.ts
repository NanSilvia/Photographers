export default interface Photographer{
    id : number;
    name : string;
    birth : Date;
    death : Date | null;
    profilepicUrl : string;
    description : string;
    videoId? : string;
}

