export interface FacebookReviewBuffetSnapshot { name:string; address:string; city:string; state:string; postalCode?:string; latitude:number; longitude:number }
export interface FacebookReview { id:string; buffetId?:string; communityLocationId?:string; facebookLocationId?:string; buffet:FacebookReviewBuffetSnapshot; facebookUrl:string; submittedAt:string; sourceIssueNumber:number }
