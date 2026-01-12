/**
 * Spoonies Blog Post Data
 *
 * Why this exists: Stores all content, citations, and structured data
 * for the spoonies pain points article. Separated from UI for maintainability.
 */

export const tocItems = [
  { id: 'who-are-spoonies', title: 'Who are "Spoonies"?', level: 2 },
  {
    id: 'challenges-pain-points',
    title: 'Challenges and Pain Points',
    level: 2,
  },
  {
    id: 'tracking-exhausting',
    title: 'Tracking feels like a full-time job',
    level: 3,
  },
  { id: 'fatigue-brain-fog', title: 'Fatigue and brain fog', level: 3 },
  {
    id: 'forgetting-inconsistency',
    title: 'Forgetting and inconsistency',
    level: 3,
  },
  { id: 'emotional-toll', title: 'Emotional toll', level: 3 },
  {
    id: 'cant-capture-whole-picture',
    title: "Apps can't capture whole picture",
    level: 3,
  },
  { id: 'lack-of-insight', title: 'Lack of insight', level: 3 },
  { id: 'doctors-dont-listen', title: "Doctors still don't listen", level: 3 },
  { id: 'usability-shortcomings', title: 'Usability shortcomings', level: 3 },
  { id: 'what-spoonies-want', title: 'What Spoonies Want', level: 2 },
  { id: 'pain-points-table', title: 'Pain Points & Solutions Table', level: 2 },
  {
    id: 'demographic-insights',
    title: 'Demographic & Community Insights',
    level: 2,
  },
  { id: 'conclusion', title: 'Conclusion', level: 2 },
  { id: 'sources', title: 'Sources', level: 2 },
];

export const citations: Record<string, { url: string; text: string }> = {
  '1': {
    url: 'https://www.healthline.com/health/spoon-theory-chronic-illness-explained-like-never-before#:~:text=Miserandino%20lives%20with%20lupus%2C%20a,living%20with%20a%20chronic%20illness',
    text: 'What is Spoon Theory? - Healthline',
  },
  '2': {
    url: 'https://www.healthline.com/health/spoon-theory-chronic-illness-explained-like-never-before#:~:text=It%E2%80%99s%20unlikely%20Miserandino%20expected%20so,%E2%80%9D',
    text: 'Spoon Theory impact on chronic illness communities',
  },
  '3': {
    url: 'https://medtruth.medium.com/chronic-illness-defined-the-spoon-theory-and-social-media-c15af62b40f5#:~:text=Self,energy%20days',
    text: 'Chronic Illness Defined: The Spoon Theory and Social Media',
  },
  '4': {
    url: 'https://www.healthline.com/health/spoon-theory-chronic-illness-explained-like-never-before#:~:text=Dawn%20Gibson%20%20is%20one,for%20those%20caring%20for%20them',
    text: 'Dawn Gibson on chronic illness advocacy',
  },
  '5': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/w6brsj/has_anyone_found_a_good_symptom_tracker_that_they/#:~:text=I%E2%80%99ve%20tried%20a%20couple%20different,them%20down%20far%20too%20often',
    text: 'Reddit - Chronic illness patients discuss symptom trackers',
  },
  '6': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/134lcaz/symptom_tracking_alone_is_a_full_time_job/#:~:text=Reddit%20www,until%20I%20got%20LC',
    text: 'Reddit - "Symptom tracking alone is a full time job"',
  },
  '7': {
    url: 'https://www.reddit.com/r/BasicBulletJournals/comments/i1ek4j/any_other_spoonies_here_looking_for_help_with/#:~:text=uberrapidash',
    text: 'Reddit - Bullet journal symptom tracking challenges',
  },
  '8': {
    url: 'https://github.com/nirukk52/Clue-Symptom-Tracker-v0/blob/ee33945d0809ca55185600266709072cf387a235/context/marketing-campaign-direction.md#L9-L17',
    text: 'Marketing research on cognitive/energy expenditure',
  },
  '9': {
    url: 'https://github.com/nirukk52/Clue-Symptom-Tracker-v0/blob/ee33945d0809ca55185600266709072cf387a235/context/marketing-campaign-direction.md#L41-L49',
    text: 'Low-friction check-in mode concept',
  },
  '10': {
    url: 'https://github.com/nirukk52/Clue-Symptom-Tracker-v0/blob/ee33945d0809ca55185600266709072cf387a235/context/marketing-campaign-direction.md#L44-L50',
    text: 'Energy-conscious design principles',
  },
  '11': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/w6brsj/has_anyone_found_a_good_symptom_tracker_that_they/#:~:text=I%E2%80%99ve%20been%20looking%20for%20a,treatment%20is%20working%20over%20time',
    text: 'Memory challenges with symptom tracking',
  },
  '12': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/w6brsj/has_anyone_found_a_good_symptom_tracker_that_they/#:~:text=Also%2C%20on%20the%20body%20map,I%20forget%20to%20use%20it',
    text: 'Forgetting to use tracking apps',
  },
  '13': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=For%20example%2C%20bearable%20gives%20me,just%20exhausting%20for%20my%20brain',
    text: 'Bearable app notification UX issues',
  },
  '14': {
    url: 'https://www.reddit.com/r/BearableApp/comments/10uf5ey/the_apps_judgment_over_my_symptoms_and_mood_makes/#:~:text=has%20a%20judgment%20over%20my,helping%2C%20it%27s%20making%20things%20worse',
    text: 'App judgment causing anxiety',
  },
  '15': {
    url: 'https://www.reddit.com/r/BearableApp/comments/10uf5ey/the_apps_judgment_over_my_symptoms_and_mood_makes/#:~:text=And%20what%27s%20even%20worse%2C%20is,enough%20up%20to%20others%27%20standards',
    text: 'Negative emotional impact of tracking visualizations',
  },
  '16': {
    url: 'https://www.reddit.com/r/BearableApp/comments/10uf5ey/the_apps_judgment_over_my_symptoms_and_mood_makes/#:~:text=that%20isn%27t%20helping%2C%20it%27s%20making,things%20worse',
    text: 'Mismatched symptom scales for chronic pain',
  },
  '17': {
    url: 'https://www.reddit.com/r/POTS/comments/1lhv5wa/has_anyone_stopped_tracking_hr/#:~:text=Has%20anyone%20stopped%20tracking%20HR%3F,with%20no%20handbook%20and',
    text: 'POTS patients and heart rate tracking anxiety',
  },
  '18': {
    url: 'https://www.thethrivingspoonie.com/the-easy-way-i-adapt-my-routine-when-im-having-a-bad-day-with-chronic-illness/#:~:text=That%E2%80%99s%20why%20I%20stopped%20tracking,as%20showing%20up%20for%20myself',
    text: 'The Thriving Spoonie on routine adaptation',
  },
  '19': {
    url: 'https://www.reddit.com/r/BearableApp/comments/10uf5ey/the_apps_judgment_over_my_symptoms_and_mood_makes/#:~:text=That%20makes%20total%20sense,it%20isn%27t%20working%20for%20you',
    text: 'Request for neutral mode in tracking apps',
  },
  '20': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/w6brsj/has_anyone_found_a_good_symptom_tracker_that_they/#:~:text=down%20far%20too%20often',
    text: 'App limitations and symptom list constraints',
  },
  '21': {
    url: 'https://www.reddit.com/r/POTS/comments/171kjuv/symptom_tracker_appjournal/#:~:text=Does%20anyone%20have%20a%20good,own%20notebook%20at%20this%20point',
    text: 'Growing symptom lists overwhelming apps',
  },
  '22': {
    url: 'https://www.reddit.com/r/POTS/comments/171kjuv/symptom_tracker_appjournal/#:~:text=a%20customizable%20one%20where%20you,own%20notebook%20at%20this%20point',
    text: 'Request for customizable symptom tracking',
  },
  '23': {
    url: 'https://www.reddit.com/r/POTS/comments/171kjuv/symptom_tracker_appjournal/#:~:text=%E2%80%A2%20%202y%20ago',
    text: 'Custom Etsy journal for symptom tracking',
  },
  '24': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/1jntrlv/best_symptom_tracking_app/#:~:text=%E2%80%A2%20%205mo%20ago',
    text: 'Using spreadsheets for symptom tracking',
  },
  '25': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=disappointed',
    text: 'Data analyst praising Bearable flexibility',
  },
  '26': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=take%20that%20time%20what%20ends,out%20and%20setting%20it%20up',
    text: 'Setup complexity overwhelm',
  },
  '27': {
    url: 'https://github.com/wanghaisheng/smart-watch-app-reviews-scrape/blob/633f0bf7abc676c50875ebc44dfff9a62f84a687/bearable-symptom-tracker-us-apple-app-review.csv#L8-L9',
    text: 'Bearable app store reviews - insight limitations',
  },
  '28': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/w6brsj/has_anyone_found_a_good_symptom_tracker_that_they/#:~:text=%E2%80%A2%20%203y%20ago',
    text: 'Users appreciate graph visualizations',
  },
  '29': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/1jntrlv/best_symptom_tracking_app/#:~:text=Seconding%20Bearable,way%20that%20was%20very%20reassuring',
    text: 'Clear patterns and privacy handling',
  },
  '30': {
    url: 'https://github.com/wanghaisheng/smart-watch-app-reviews-scrape/blob/633f0bf7abc676c50875ebc44dfff9a62f84a687/bearable-symptom-tracker-us-apple-app-review.csv#L10-L11',
    text: 'Stress reduction through automated analysis',
  },
  '31': {
    url: 'https://www.reddit.com/r/BearableApp/comments/15xcom2/tips_for_tracking_pacing_cfs_long_covid_fibro_etc/#:~:text=Tips%20for%20tracking%20pacing%21%20,designed%20by',
    text: 'ME/CFS pacing and HRV tracking',
  },
  '32': {
    url: 'https://www.reddit.com/r/BasicBulletJournals/comments/i1ek4j/any_other_spoonies_here_looking_for_help_with/#:~:text=Long%20story%20short%2C%20I%20have,to%20help%20doctors%20help%20me',
    text: 'Motivation to help doctors help patients',
  },
  '33': {
    url: 'https://github.com/wanghaisheng/smart-watch-app-reviews-scrape/blob/633f0bf7abc676c50875ebc44dfff9a62f84a687/bearable-symptom-tracker-us-apple-app-review.csv#L2-L5',
    text: 'Empirical data for doctor communication',
  },
  '34': {
    url: 'https://github.com/wanghaisheng/smart-watch-app-reviews-scrape/blob/633f0bf7abc676c50875ebc44dfff9a62f84a687/bearable-symptom-tracker-us-apple-app-review.csv#L12-L15',
    text: 'Value of data for medical appointments',
  },
  '35': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/w6brsj/has_anyone_found_a_good_symptom_tracker_that_they/#:~:text=,tell%20it%20to%2C%20so%20you',
    text: 'Doctors appreciate clear reports',
  },
  '36': {
    url: 'https://www.reddit.com/r/BasicBulletJournals/comments/i1ek4j/any_other_spoonies_here_looking_for_help_with/#:~:text=%E2%80%A2%20%205y%20ago',
    text: 'Medical gaslighting with tracking data',
  },
  '37': {
    url: 'https://medtruth.medium.com/chronic-illness-defined-the-spoon-theory-and-social-media-c15af62b40f5#:~:text=Chronic%20illness%20advocate%20and%20Spoonie,%E2%80%9D',
    text: 'Medical gaslighting in chronic illness',
  },
  '38': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/1jntrlv/best_symptom_tracking_app/#:~:text=Migraine%20Buddy%20worked%20for%20me%2C,share%20data%20with%20my%20specialist',
    text: 'Migraine Buddy data sharing with specialists',
  },
  '39': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/1jntrlv/best_symptom_tracking_app/#:~:text=water%20intake%20and%20food%20intake%2C,of%20other%20stuff%20for%20free',
    text: 'App features for doctor visit preparation',
  },
  '40': {
    url: 'https://github.com/nirukk52/Clue-Symptom-Tracker-v0/blob/ee33945d0809ca55185600266709072cf387a235/context/marketing-campaign-direction.md#L55-L62',
    text: 'Doctor communication feature needs',
  },
  '41': {
    url: 'https://github.com/nirukk52/Clue-Symptom-Tracker-v0/blob/ee33945d0809ca55185600266709072cf387a235/context/marketing-campaign-direction.md#L56-L62',
    text: 'Doctor Pack concept for clinician summaries',
  },
  '42': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=Amongst%20other%20stuff%20I%20have,as%20possible%20and%20get%20out',
    text: 'Cognitive overload from busy interfaces',
  },
  '43': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=Facebook%20for%20me%2C%20sometimes%20Google,or%20informational%20features%20in%20Bearable',
    text: 'Distraction from community features',
  },
  '44': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/w6brsj/has_anyone_found_a_good_symptom_tracker_that_they/#:~:text=Ive%20recommended%20this%20elsewhere%2C%20but,to%20set%20up%20your%20list',
    text: 'Quick logging praised in Daylio',
  },
  '45': {
    url: 'https://www.instagram.com/p/DMYV_ityB_0/#:~:text=,touch%2C%20and',
    text: 'Laso voice-first tracking',
  },
  '46': {
    url: 'https://www.facebook.com/getlasoapp/#:~:text=Symptom%20tracking%20isn%27t%20broken%20because,touch',
    text: 'Voice-based low-touch tracking concept',
  },
  '47': {
    url: 'https://github.com/wanghaisheng/smart-watch-app-reviews-scrape/blob/633f0bf7abc676c50875ebc44dfff9a62f84a687/bearable-symptom-tracker-us-apple-app-review.csv#L12-L13',
    text: 'Request for more engaging visual design',
  },
  '48': {
    url: 'https://www.reddit.com/r/POTS/comments/171kjuv/symptom_tracker_appjournal/#:~:text=I%E2%80%99m%20using%20Cardiogram%3B%20it%20has,my%20heart%20rate%20was%20high',
    text: 'Wearable sync issues',
  },
  '49': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=I%27m%20all%20for%20complex%20apps,I%20was%20just%20thoroughly%20disappointed',
    text: 'All-in-one vs niche app preferences',
  },
  '50': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/w6brsj/has_anyone_found_a_good_symptom_tracker_that_they/#:~:text=how%20severe%20or%20common%20they,of%20available%20symptoms%20to%20track',
    text: 'Need for flexible symptom lists',
  },
  '51': {
    url: 'https://www.reddit.com/r/BasicBulletJournals/comments/i1ek4j/any_other_spoonies_here_looking_for_help_with/#:~:text=tracker',
    text: 'Discovering new symptoms over time',
  },
  '52': {
    url: 'https://www.reddit.com/r/BasicBulletJournals/comments/i1ek4j/any_other_spoonies_here_looking_for_help_with/#:~:text=I%20just%20recently%20started%20a,for%20a%20monthly%20symptom%2Fhabit%20tracker',
    text: 'Monthly symptom/habit tracker needs',
  },
  '53': {
    url: 'https://www.reddit.com/r/BasicBulletJournals/comments/i1ek4j/any_other_spoonies_here_looking_for_help_with/#:~:text=Hmm,hope%20it%20will%20benefit%20you',
    text: 'Index system for symptom tracking',
  },
  '54': {
    url: 'https://github.com/wanghaisheng/smart-watch-app-reviews-scrape/blob/633f0bf7abc676c50875ebc44dfff9a62f84a687/bearable-symptom-tracker-us-apple-app-review.csv#L3-L5',
    text: 'Life-changing correlation discoveries',
  },
  '55': {
    url: 'https://github.com/wanghaisheng/smart-watch-app-reviews-scrape/blob/633f0bf7abc676c50875ebc44dfff9a62f84a687/bearable-symptom-tracker-us-apple-app-review.csv#L2-L3',
    text: 'Apple Health and wearable integration',
  },
  '56': {
    url: 'https://github.com/wanghaisheng/smart-watch-app-reviews-scrape/blob/633f0bf7abc676c50875ebc44dfff9a62f84a687/bearable-symptom-tracker-us-apple-app-review.csv#L14-L15',
    text: 'Scattered data frustrations',
  },
  '57': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/1jntrlv/best_symptom_tracking_app/#:~:text=guava%20is%20good%20option%20for,so%20far%20it%20seems%20good',
    text: 'Guava app for medical records',
  },
  '58': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/1jntrlv/best_symptom_tracking_app/#:~:text=things%20like%20heart%20rate%20and,of%20other%20stuff%20for%20free',
    text: 'Health hub integration features',
  },
  '59': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/1jntrlv/best_symptom_tracking_app/#:~:text=spot%20so%20you%20can%20write,of%20other%20stuff%20for%20free',
    text: 'Period tracker integration needs',
  },
  '60': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/w6brsj/has_anyone_found_a_good_symptom_tracker_that_they/#:~:text=I%20really%20enjoy%20PainScale%2C%20a,especially%20like%20that%20it%E2%80%99s%20free',
    text: 'PainScale free app appreciation',
  },
  '61': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/w6brsj/has_anyone_found_a_good_symptom_tracker_that_they/#:~:text=I%20have%20several%20mental%20and,you%20do%20one%20maybe%20two',
    text: 'Multi-symptom logging needs',
  },
  '62': {
    url: 'https://www.reddit.com/r/BearableApp/comments/10uf5ey/the_apps_judgment_over_my_symptoms_and_mood_makes/#:~:text=good%20enough%20up%20to%20others%27,standards',
    text: 'Paid apps not meeting expectations',
  },
  '63': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=And%20even%20then%20all%20that,knowledge%20that%20would%20help%20me',
    text: 'Negative experience with community apps',
  },
  '64': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=so%20I%E2%80%99m%20also%20chronically%20ill%2Fhave,for%20a%20couple%20of%20reasons',
    text: 'Opt-out preferences for community features',
  },
  '65': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=offering%20this%20feature%20because%20I,for%20a%20couple%20of%20reasons',
    text: 'Request to permanently hide community features',
  },
  '66': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=%E2%80%A2%20%204y%20ago',
    text: 'Developer presence on Reddit valued',
  },
  '67': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=I%20also%20want%20to%20say,for%20all%20that%20you%20do',
    text: 'Appreciation for responsive developers',
  },
  '68': {
    url: 'https://www.reddit.com/r/ChronicIllness/comments/1jntrlv/best_symptom_tracking_app/#:~:text=%E2%80%A2%20%209mo%20ago',
    text: 'Skip dose medication tracking request',
  },
  '69': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=Chronic%20illnesses%20are%20a%20burden%2C,want%20the%20clutter%20and%20distraction',
    text: 'Tracking causing negative focus on illness',
  },
  '70': {
    url: 'https://github.com/nirukk52/Clue-Symptom-Tracker-v0/blob/ee33945d0809ca55185600266709072cf387a235/context/marketing-campaign-direction.md#L23-L31',
    text: 'Health detective community insight',
  },
  '71': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=doesn%27t%20interfere%20with%20the%20Bearable,experience',
    text: 'Appreciation for developer feedback engagement',
  },
  '72': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=Sorry%20for%20the%20essay%2C%20I,it%20except%20to%20view%20correlations',
    text: 'Dream of low-effort, high-impact tracking',
  },
  '73': {
    url: 'https://github.com/wanghaisheng/smart-watch-app-reviews-scrape/blob/633f0bf7abc676c50875ebc44dfff9a62f84a687/bearable-symptom-tracker-us-apple-app-review.csv#L2-L9',
    text: 'App store review insights - likes and dislikes',
  },
  '74': {
    url: 'https://github.com/wanghaisheng/smart-watch-app-reviews-scrape/blob/633f0bf7abc676c50875ebc44dfff9a62f84a687/bearable-symptom-tracker-us-apple-app-review.csv#L10-L15',
    text: 'App store reviews - real-world usage patterns',
  },
  '75': {
    url: 'https://github.com/nirukk52/Clue-Symptom-Tracker-v0/blob/ee33945d0809ca55185600266709072cf387a235/context/marketing-campaign-direction.md#L21-L29',
    text: 'Emily persona - data-driven Long COVID warrior',
  },
  '76': {
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/#:~:text=I%27ve%20wanted%20an%20app%20like,out%20and%20setting%20it%20up',
    text: 'Long-term app wishlist from users',
  },
};

export const painPointsTable = [
  {
    painPoint:
      'Tracking is exhausting (feels like a job, too many symptoms to log)',
    citations: ['6', '5'],
    solution:
      'Low-effort logging: quick check-in modes for low-energy days; ability to log multiple symptoms at once with one tap each (batch entry). Voice input or one-button logging to conserve "spoons".',
    solutionCitations: ['10', '44', '45', '46'],
  },
  {
    painPoint:
      'Forgetting or unable to log consistently (memory issues, flares)',
    citations: ['12', '11'],
    solution:
      'Smart reminders and easy access: customizable notifications that allow one-tap or voice logging from the alert; home-screen widgets or prompts at set times of day. No penalty for missed days - encourage return without guilt.',
    solutionCitations: ['13', '44', '18'],
  },
  {
    painPoint:
      'Emotional distress from tracking (anxiety, feeling judged by app)',
    citations: ['14', '15'],
    solution:
      'Neutral, supportive design: option to disable color-coding/emoji "mood faces"; use neutral language (e.g. "low energy day" instead of "bad" day); positive reinforcement for any logging effort. Ensure scales can be personalized.',
    solutionCitations: ['14', '16'],
  },
  {
    painPoint:
      "Apps too inflexible or limited (can't track all symptoms or factors)",
    citations: ['20', '23'],
    solution:
      'Unlimited customization: allow users to add as many symptoms, triggers, medications, etc. as needed. Large library of conditions and symptoms pre-loaded, but also let user create custom entries. No hard caps on tracking categories.',
    solutionCitations: ['5', '61'],
  },
  {
    painPoint:
      'Complex setup and data overload (hard to figure out what/how to track)',
    citations: ['26', '23'],
    solution:
      'Guided templates and flexibility: provide starter templates for common illnesses (users can then edit or remove fields) to reduce setup time. In-app tips or an "assist me in deciding what to track" wizard. Customizable without overwhelming.',
    solutionCitations: ['55'],
  },
  {
    painPoint:
      "Lack of useful insights (data just sits there, can't see patterns)",
    citations: ['27', '20'],
    solution:
      'Analytics and insights: generate charts of symptom trends over weeks/months; calculate correlations between factors and symptoms; highlight potential triggers and improvements. Turn raw data into actionable knowledge.',
    solutionCitations: ['28', '27'],
  },
  {
    painPoint:
      "Timeline granularity issues (can't log timing or sequence of events)",
    citations: ['27'],
    solution:
      'Detailed timestamping & timeline: allow users to log the exact time of each symptom or factor if they want. Support multiple entries per day for a symptom. Visual timeline that differentiates triggers vs. outcomes.',
    solutionCitations: ['33'],
  },
  {
    painPoint: 'Integration woes (data spread across apps, manual duplication)',
    citations: ['56', '48'],
    solution:
      'Data integration: sync with Apple Health, Google Fit, Fitbit, Oura, etc. to import steps, heart rate, sleep automatically. Allow importing external data (CSV, etc.) so users can consolidate past records. Provide data export.',
    solutionCitations: ['55', '27'],
  },
  {
    painPoint:
      'Medication tracking limitations (no way to log skipped doses, etc.)',
    citations: ['68'],
    solution:
      'Robust med tracker: include medication schedules with options to mark taken, skipped, or delayed. Send dose reminders and allow logging from the notification. Track PRN meds alongside daily ones.',
    solutionCitations: ['68'],
  },
  {
    painPoint: 'Difficult to share with doctors (raw logs not doctor-friendly)',
    citations: ['36', '35'],
    solution:
      'Doctor report/export: one-click generation of a neatly formatted report highlighting key data (trends, averages, outliers). Include graphs and a concise summary that doctors can quickly scan. Possibly a mode to summarize "since last appointment" changes.',
    solutionCitations: ['35'],
  },
  {
    painPoint:
      'Distracting or cluttered interface (too much going on for brain fog/ADHD)',
    citations: ['42', '13'],
    solution:
      'Focus-optimized UI: provide a clean, simple home screen focused on logging and viewing data. Make community content optional (able to be hidden). Minimize unnecessary notifications. Use clear, large text and high-contrast options.',
    solutionCitations: ['65', '63'],
  },
  {
    painPoint:
      'Negative feedback loop (focusing on illness all the time brings mood down)',
    citations: ['14', '69'],
    solution:
      'Positive and flexible approach: incorporate wellness tracking too (e.g. log good days, improvements). Allow taking breaks - perhaps a mode to pause tracking and resume later without feeling like you "failed."',
    solutionCitations: [],
  },
];

export const sourceLinks = [
  {
    citations: ['5', '11', '12', '20', '28', '35', '44', '50', '60', '61'],
    title:
      'Has anyone found a good symptom tracker that they really like? : r/ChronicIllness',
    url: 'https://www.reddit.com/r/ChronicIllness/comments/w6brsj/has_anyone_found_a_good_symptom_tracker_that_they/',
  },
  {
    citations: ['6'],
    title: 'Symptom tracking alone is a full time job. : r/ChronicIllness',
    url: 'https://www.reddit.com/r/ChronicIllness/comments/134lcaz/symptom_tracking_alone_is_a_full_time_job/',
  },
  {
    citations: ['7', '32', '36', '51', '52', '53'],
    title:
      'Any other spoonies here? Looking for help with symptom tracking. : r/BasicBulletJournals',
    url: 'https://www.reddit.com/r/BasicBulletJournals/comments/i1ek4j/any_other_spoonies_here_looking_for_help_with/',
  },
  {
    citations: ['8', '9', '10', '40', '41', '70', '75'],
    title: 'marketing-campaign-direction.md',
    url: 'https://github.com/nirukk52/Clue-Symptom-Tracker-v0/blob/ee33945d0809ca55185600266709072cf387a235/context/marketing-campaign-direction.md',
  },
  {
    citations: [
      '13',
      '25',
      '26',
      '42',
      '43',
      '49',
      '63',
      '64',
      '65',
      '66',
      '67',
      '69',
      '71',
      '72',
      '76',
    ],
    title:
      "Those of you with chronic health issues, I'm curious where you tend to MAINLY find out information... : r/BearableApp",
    url: 'https://www.reddit.com/r/BearableApp/comments/ulxgr8/those_of_you_with_chronic_health_issues_im/',
  },
  {
    citations: ['14', '15', '16', '19', '62'],
    title:
      "The apps 'judgment' over my symptoms and mood makes me anxious... : r/BearableApp",
    url: 'https://www.reddit.com/r/BearableApp/comments/10uf5ey/the_apps_judgment_over_my_symptoms_and_mood_makes/',
  },
  {
    citations: ['17'],
    title: 'Has anyone stopped tracking HR? : r/POTS',
    url: 'https://www.reddit.com/r/POTS/comments/1lhv5wa/has_anyone_stopped_tracking_hr/',
  },
  {
    citations: ['18'],
    title: 'How I Adapt My Routine on Bad Days With Chronic Illness',
    url: 'https://www.thethrivingspoonie.com/the-easy-way-i-adapt-my-routine-when-im-having-a-bad-day-with-chronic-illness/',
  },
  {
    citations: ['21', '22', '23', '48'],
    title: 'Symptom tracker app/journal : r/POTS',
    url: 'https://www.reddit.com/r/POTS/comments/171kjuv/symptom_tracker_appjournal/',
  },
  {
    citations: ['24', '29', '38', '39', '57', '58', '59', '68'],
    title: 'Best Symptom Tracking App : r/ChronicIllness',
    url: 'https://www.reddit.com/r/ChronicIllness/comments/1jntrlv/best_symptom_tracking_app/',
  },
  {
    citations: ['27', '30', '33', '34', '47', '54', '55', '56', '73', '74'],
    title: 'bearable-symptom-tracker-us-apple-app-review.csv',
    url: 'https://github.com/wanghaisheng/smart-watch-app-reviews-scrape/blob/633f0bf7abc676c50875ebc44dfff9a62f84a687/bearable-symptom-tracker-us-apple-app-review.csv',
  },
  {
    citations: ['31'],
    title:
      'Tips for tracking pacing! (CFS / long COVID / fibro / etc.) - Reddit',
    url: 'https://www.reddit.com/r/BearableApp/comments/15xcom2/tips_for_tracking_pacing_cfs_long_covid_fibro_etc/',
  },
  {
    citations: ['45'],
    title: 'Laso - Instagram',
    url: 'https://www.instagram.com/p/DMYV_ityB_0/',
  },
  {
    citations: ['46'],
    title: 'Laso - Facebook',
    url: 'https://www.facebook.com/getlasoapp/',
  },
  {
    citations: ['1', '2', '4'],
    title: 'What is Spoon Theory? - Healthline',
    url: 'https://www.healthline.com/health/spoon-theory-chronic-illness-explained-like-never-before',
  },
  {
    citations: ['3', '37'],
    title:
      'Chronic Illness Defined: The Spoon Theory and Social Media | Medium',
    url: 'https://medtruth.medium.com/chronic-illness-defined-the-spoon-theory-and-social-media-c15af62b40f5',
  },
];
