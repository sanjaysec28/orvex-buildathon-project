export interface IndianStateCities {
  state: string;
  cities: readonly string[];
}

export const INDIAN_STATES_CITIES: readonly IndianStateCities[] = [
  {
    state: 'Tamil Nadu',
    cities: ['Chennai', 'Coimbatore', 'Madurai', 'Hosur', 'Tiruchirappalli', 'Salem', 'Erode', 'Tiruppur', 'Vellore', 'Thoothukudi'],
  },
  {
    state: 'Karnataka',
    cities: ['Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Tumakuru', 'Davanagere', 'Ballari', 'Shivamogga'],
  },
  {
    state: 'Andhra Pradesh',
    cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore', 'Kurnool', 'Rajahmundry', 'Kakinada'],
  },
  {
    state: 'Telangana',
    cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar'],
  },
  {
    state: 'Kerala',
    cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad'],
  },
  {
    state: 'Maharashtra',
    cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Kolhapur', 'Solapur'],
  },
  {
    state: 'Gujarat',
    cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Vapi', 'Gandhidham', 'Bharuch'],
  },
  {
    state: 'Delhi',
    cities: ['New Delhi', 'North Delhi', 'South Delhi', 'West Delhi', 'East Delhi'],
  },
  {
    state: 'Haryana',
    cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar'],
  },
  {
    state: 'Uttar Pradesh',
    cities: ['Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj'],
  },
  {
    state: 'Rajasthan',
    cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar'],
  },
  {
    state: 'West Bengal',
    cities: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol'],
  },
  {
    state: 'Madhya Pradesh',
    cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'],
  },
  {
    state: 'Punjab',
    cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  },
  {
    state: 'Odisha',
    cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur'],
  },
  {
    state: 'Bihar',
    cities: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'],
  },
  {
    state: 'Assam',
    cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'],
  },
  {
    state: 'Jharkhand',
    cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
  },
  {
    state: 'Chhattisgarh',
    cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'],
  },
  {
    state: 'Uttarakhand',
    cities: ['Dehradun', 'Haridwar', 'Haldwani', 'Rudrapur'],
  },
  {
    state: 'Himachal Pradesh',
    cities: ['Shimla', 'Baddi', 'Solan', 'Mandi'],
  },
  {
    state: 'Goa',
    cities: ['Panaji', 'Margao', 'Vasco da Gama'],
  },
  {
    state: 'Chandigarh',
    cities: ['Chandigarh'],
  },
  {
    state: 'Puducherry',
    cities: ['Puducherry', 'Karaikal'],
  },
  {
    state: 'Jammu and Kashmir',
    cities: ['Jammu', 'Srinagar', 'Udhampur'],
  },
  {
    state: 'Tripura',
    cities: ['Agartala'],
  },
  {
    state: 'Meghalaya',
    cities: ['Shillong'],
  },
  {
    state: 'Manipur',
    cities: ['Imphal'],
  },
  {
    state: 'Nagaland',
    cities: ['Dimapur', 'Kohima'],
  },
  {
    state: 'Arunachal Pradesh',
    cities: ['Itanagar'],
  },
  {
    state: 'Mizoram',
    cities: ['Aizawl'],
  },
  {
    state: 'Sikkim',
    cities: ['Gangtok'],
  },
  {
    state: 'Andaman and Nicobar Islands',
    cities: ['Port Blair'],
  },
  {
    state: 'Dadra and Nagar Haveli and Daman and Diu',
    cities: ['Silvassa', 'Daman'],
  },
  {
    state: 'Ladakh',
    cities: ['Leh', 'Kargil'],
  },
  {
    state: 'Lakshadweep',
    cities: ['Kavaratti'],
  },
] as const;

export function getCitiesForState(stateName: string): readonly string[] {
  const found = INDIAN_STATES_CITIES.find((entry) => entry.state === stateName);
  return found ? found.cities : [];
}
