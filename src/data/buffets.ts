import type { Buffet } from '../types/Buffet'

/**
 * SAMPLE / MOCK DATA ONLY.
 * These fictional listings, scores, dates, and review associations are UI fixtures.
 * They are not asserted to be restaurants reviewed by Mullet Review. Replace every
 * record with independently verified catalog data before treating the map as factual.
 */
export const buffets: Buffet[] = [
  {
    id: 'desert-spoon-phoenix-az', name: 'Desert Spoon Buffet', address: '100 W Sample Ave',
    city: 'Phoenix', state: 'AZ', postalCode: '85003', latitude: 33.4484, longitude: -112.074,
    youtubeVideoId: 'aqz-KE-bpKQ', youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    reviewDate: '2025-02-14', yelpUrl: 'https://www.yelp.com/search?find_desc=buffet&find_loc=Phoenix%2C+AZ',
    yelpRating: 4.1, yelpReviewCount: 327, reviewerRating: 8.2, buffetType: 'American', price: '$$',
    isOpen: true, notes: 'Sample note: a broad comfort-food lineup with a sunny patio.',
  },
  {
    id: 'copper-wok-mesa-az', name: 'Copper Wok Feast', address: '200 E Example Rd',
    city: 'Mesa', state: 'AZ', postalCode: '85201', latitude: 33.4152, longitude: -111.8315,
    youtubeVideoId: 'aqz-KE-bpKQ', youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    reviewDate: '2025-04-03', yelpUrl: 'https://www.yelp.com/search?find_desc=buffet&find_loc=Mesa%2C+AZ',
    yelpRating: 3.7, yelpReviewCount: 184, reviewerRating: 7.4, buffetType: 'Asian fusion', price: '$$',
    isOpen: true, notes: 'Sample note: made-to-order noodle station and rotating desserts.',
  },
  {
    id: 'saguaro-table-tucson-az', name: 'Saguaro Table', address: '300 Mockingbird Ln',
    city: 'Tucson', state: 'AZ', postalCode: '85701', latitude: 32.2226, longitude: -110.9747,
    youtubeVideoId: 'aqz-KE-bpKQ', youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    reviewDate: '2024-11-21', yelpUrl: 'https://www.yelp.com/search?find_desc=buffet&find_loc=Tucson%2C+AZ',
    yelpRating: 4.4, yelpReviewCount: 92, reviewerRating: 8.8, buffetType: 'Southwestern brunch', price: '$$$',
    notes: 'Sample note: weekend brunch flavors inspired by the Sonoran desert.',
  },
  {
    id: 'high-country-harvest-flagstaff-az', name: 'High Country Harvest', address: '400 Test Route',
    city: 'Flagstaff', state: 'AZ', postalCode: '86001', latitude: 35.1983, longitude: -111.6513,
    buffetType: 'Mountain lodge', price: '$$$', isOpen: true,
    notes: 'Sample note: a cozy seasonal spread. Video and Yelp details intentionally omitted.',
  },
  {
    id: 'red-rock-roundup-sedona-az', name: 'Red Rock Roundup', address: '500 Placeholder Blvd',
    city: 'Sedona', state: 'AZ', latitude: 34.8697, longitude: -111.761,
    youtubeVideoId: 'aqz-KE-bpKQ', youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    yelpUrl: 'https://www.yelp.com/search?find_desc=buffet&find_loc=Sedona%2C+AZ',
    reviewerRating: 6.9, buffetType: 'Barbecue', price: '$$', isOpen: false,
    notes: 'Sample note: smokehouse classics with red-rock views. Marked closed to test status display.',
  },
]
