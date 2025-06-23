export default interface Photographer {
  id: number;
  name: string;
  birth: Date;
  death: Date | null;
  profilepicUrl: string | null;
  description: string | null;
  videoId?: string;
}
