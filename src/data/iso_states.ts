/**

Services to TPP: Many states have started to tax services to tangible personal property at the same rate as sales of TPP. These services typically improve or repair property. Services to TPP could include anything from carpentry services to car repair.

Services to real property: Improvements to buildings and land fall into this category. One of the most commonly taxed services in this area is landscaping and lawn service. Janitorial services also fall into this category.

Business services: Services performed for companies and businesses fall into this category. Examples include telephone answering services, credit reporting agencies and credit bureaus, and extermination services.

Personal services: Personal services include a range of businesses that provide personal grooming or other types of “self-improvement.” For example, tanning salons, massages not performed by a licensed massage therapist, and animal grooming services can be considered “personal services.”

Professional services: The least taxed service area, in large part because professional groups have powerful lobbying presences. Professional services include attorneys, physicians, accountants, and other licensed professionals.

Amusement/Recreation: Admission to recreational events and amusement parks, as well as other types of entertainment. Some states that tax very few other services, like Utah, still tax admission charges to most sporting and entertainment events.

*/

const state = 'state';
const outlying_area = 'outlying_area';
const district = 'district';

export type IsoState = {
  subdivision_category: 'state' | 'outlying_area' | 'district';
  name: string;
  code: string;
};

//eslint-disable-next-line max-lines-per-function
export function isoStates(): IsoState[] {
  return [
    { subdivision_category: state, code: 'US-AL', name: 'Alabama' },
    { subdivision_category: state, code: 'US-AK', name: 'Alaska' },
    {
      subdivision_category: outlying_area,
      code: 'US-AS',
      name: 'American Samoa',
    },
    { subdivision_category: state, code: 'US-AZ', name: 'Arizona' },
    { subdivision_category: state, code: 'US-AR', name: 'Arkansas' },
    { subdivision_category: state, code: 'US-CA', name: 'California' },
    { subdivision_category: state, code: 'US-CO', name: 'Colorado' },
    { subdivision_category: state, code: 'US-CT', name: 'Connecticut' },
    { subdivision_category: state, code: 'US-DE', name: 'Delaware' },
    {
      subdivision_category: district,
      code: 'US-DC',
      name: 'District of Columbia',
    },
    { subdivision_category: state, code: 'US-FL', name: 'Florida' },
    { subdivision_category: state, code: 'US-GA', name: 'Georgia' },
    {
      subdivision_category: outlying_area,
      code: 'US-GU',
      name: 'Guam',
    },
    { subdivision_category: state, code: 'US-HI', name: 'Hawaii' },
    { subdivision_category: state, code: 'US-ID', name: 'Idaho' },
    { subdivision_category: state, code: 'US-IL', name: 'Illinois' },
    { subdivision_category: state, code: 'US-IN', name: 'Indiana' },
    { subdivision_category: state, code: 'US-IA', name: 'Iowa' },
    { subdivision_category: state, code: 'US-KS', name: 'Kansas' },
    { subdivision_category: state, code: 'US-KY', name: 'Kentucky' },
    { subdivision_category: state, code: 'US-LA', name: 'Louisiana' },
    { subdivision_category: state, code: 'US-ME', name: 'Maine' },
    { subdivision_category: state, code: 'US-MD', name: 'Maryland' },
    { subdivision_category: state, code: 'US-MA', name: 'Massachusetts' },
    { subdivision_category: state, code: 'US-MI', name: 'Michigan' },
    { subdivision_category: state, code: 'US-MN', name: 'Minnesota' },
    { subdivision_category: state, code: 'US-MS', name: 'Mississippi' },
    { subdivision_category: state, code: 'US-MO', name: 'Missouri' },
    { subdivision_category: state, code: 'US-MT', name: 'Montana' },
    { subdivision_category: state, code: 'US-NE', name: 'Nebraska' },
    { subdivision_category: state, code: 'US-NV', name: 'Nevada' },
    { subdivision_category: state, code: 'US-NH', name: 'New Hampshire' },
    { subdivision_category: state, code: 'US-NJ', name: 'New Jersey' },
    { subdivision_category: state, code: 'US-NM', name: 'New Mexico' },
    { subdivision_category: state, code: 'US-NY', name: 'New York' },
    { subdivision_category: state, code: 'US-NC', name: 'North Carolina' },
    { subdivision_category: state, code: 'US-ND', name: 'North Dakota' },
    {
      subdivision_category: outlying_area,
      code: 'US-MP',
      name: 'Northern Mariana Islands',
    },
    { subdivision_category: state, code: 'US-OH', name: 'Ohio' },
    { subdivision_category: state, code: 'US-OK', name: 'Oklahoma' },
    { subdivision_category: state, code: 'US-OR', name: 'Oregon' },
    { subdivision_category: state, code: 'US-PA', name: 'Pennsylvania' },
    {
      subdivision_category: outlying_area,
      code: 'US-PR',
      name: 'Puerto Rico',
    },
    { subdivision_category: state, code: 'US-RI', name: 'Rhode Island' },
    { subdivision_category: state, code: 'US-SC', name: 'South Carolina' },
    { subdivision_category: state, code: 'US-SD', name: 'South Dakota' },
    { subdivision_category: state, code: 'US-TN', name: 'Tennessee' },
    { subdivision_category: state, code: 'US-TX', name: 'Texas' },
    {
      subdivision_category: outlying_area,
      code: 'US-UM',
      name: 'United States Minor Outlying Islands',
    },
    { subdivision_category: state, code: 'US-UT', name: 'Utah' },
    { subdivision_category: state, code: 'US-VT', name: 'Vermont' },
    {
      subdivision_category: outlying_area,
      code: 'US-VI',
      name: 'Virgin Islands, U.S.',
    },
    { subdivision_category: state, code: 'US-VA', name: 'Virginia' },
    { subdivision_category: state, code: 'US-WA', name: 'Washington' },
    { subdivision_category: state, code: 'US-WV', name: 'West Virginia' },
    { subdivision_category: state, code: 'US-WI', name: 'Wisconsin' },
    { subdivision_category: state, code: 'US-WY', name: 'Wyoming' },
  ];
}
