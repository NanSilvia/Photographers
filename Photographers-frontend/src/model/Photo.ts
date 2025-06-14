import Photographer from "./Photographer"

export default interface Photo {
    id: number
    photographer: Photographer
    title: string
    description: string
    imageUrl: string
    tags: string[]
}