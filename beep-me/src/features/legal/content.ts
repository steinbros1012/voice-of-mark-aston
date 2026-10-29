/**
 * Legal documents shown in the app. Bump TERMS_VERSION whenever the Terms or
 * Privacy Policy change; signed-in students are asked to accept again.
 *
 * These drafts follow the structure used by peer-to-peer ride-sharing
 * platforms (platform-only role, cost sharing, assumption of risk, arbitration).
 * They are a starting point, not legal advice: have a North Carolina attorney
 * review them before launch.
 */
export const TERMS_VERSION = '2026-10-29';

export type LegalSection = { heading: string; paragraphs: string[] };
export type LegalDoc = { slug: 'terms' | 'privacy' | 'guidelines'; title: string; updated: string; intro: string; sections: LegalSection[] };

export const LEGAL_DOCS: Record<LegalDoc['slug'], LegalDoc> = {
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    updated: 'October 29, 2026',
    intro:
      'These Terms govern your use of Beep Me, a marketplace where verified students offer and request seats on trips they are already taking. By creating an account you agree to them.',
    sections: [
      {
        heading: '1. What Beep Me is, and is not',
        paragraphs: [
          'Beep Me is a technology platform that connects students who are driving somewhere with students who need a ride. Beep Me is not a transportation carrier, taxi service, or transportation network company. It does not own vehicles, employ drivers, dispatch rides, or provide transportation.',
          'Drivers and riders contract with each other, not with Beep Me. Any ride arranged through the app is a private arrangement between the two students involved.',
        ],
      },
      {
        heading: '2. Cost sharing, not commercial fares',
        paragraphs: [
          'Prices on Beep Me are contributions toward the cost of a trip the driver is already making, such as fuel, tolls, and wear on the vehicle. They are not commercial fares. Drivers must not use Beep Me to run a for-profit transportation business.',
          'Beep Me collects the rider’s payment and keeps a platform fee of 15% of the seat price plus any booking fee shown at checkout. The remainder is transferred to the driver after the ride is marked complete. Payment processing is handled by Stripe under its own terms.',
        ],
      },
      {
        heading: '3. Eligibility and verification',
        paragraphs: [
          'You must be at least 18 years old and hold a current student email address at a supported university. Verification confirms that you control that email address. It is not an identity check, driving-record check, vehicle inspection, or criminal background check, and Beep Me makes no representation about any user’s driving ability, insurance, character, or safety.',
        ],
      },
      {
        heading: '4. Driver responsibilities',
        paragraphs: [
          'If you offer seats you represent that you hold a valid driver’s license, that the vehicle is registered, roadworthy, and insured as required by law, and that you have confirmed with your insurer that carrying passengers who share costs is covered by your policy. You alone are responsible for how you drive and for complying with traffic law.',
          'Do not drive while impaired, distracted, or fatigued. Do not carry more passengers than seat belts.',
        ],
      },
      {
        heading: '5. Rider responsibilities',
        paragraphs: [
          'Be on time at the agreed pickup spot, wear a seat belt, and treat the driver and their vehicle with respect. You are responsible for your belongings.',
        ],
      },
      {
        heading: '6. Bookings, cancellations, and refunds',
        paragraphs: [
          'A rider’s request becomes a booking when the driver accepts it, at which point the rider’s saved payment method is charged. Riders may cancel any time before the scheduled departure for a full refund. Drivers who cancel a ride release every seat and all riders are refunded in full. After departure, bookings are not refundable through the app; contact support with any dispute within 7 days.',
        ],
      },
      {
        heading: '7. Assumption of risk and release',
        paragraphs: [
          'Riding in or driving a private vehicle involves inherent risks, including injury, death, and property damage. To the fullest extent permitted by law, you voluntarily assume those risks and release Beep Me, its owners, and its staff from any claim arising from a ride arranged through the app, including claims based on the conduct of another user.',
          'This release does not apply to Beep Me’s own gross negligence or willful misconduct, and nothing in these Terms limits rights that cannot be waived under applicable law.',
        ],
      },
      {
        heading: '8. Limitation of liability',
        paragraphs: [
          'To the fullest extent permitted by law, Beep Me’s total liability for any claim relating to the app is limited to the greater of the platform fees you paid in the 12 months before the claim or US$100. Beep Me is not liable for indirect, incidental, or consequential damages.',
        ],
      },
      {
        heading: '9. Community rules and enforcement',
        paragraphs: [
          'The Community Guidelines are part of these Terms. Beep Me may suspend or remove accounts, rides, or content that break them, and may share information with university or law enforcement authorities where safety or the law requires.',
        ],
      },
      {
        heading: '10. Disputes and arbitration',
        paragraphs: [
          'Any dispute with Beep Me will be resolved by binding individual arbitration in New Hanover County, North Carolina, under the rules of the American Arbitration Association, rather than in court, except that either party may bring an individual claim in small-claims court. Class actions are waived to the extent the law allows. North Carolina law governs these Terms.',
        ],
      },
      {
        heading: '11. Changes',
        paragraphs: [
          'Beep Me may update these Terms. When the changes are material, you will be asked to accept the new version in the app before continuing to use it.',
        ],
      },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    updated: 'October 29, 2026',
    intro: 'This policy explains what Beep Me collects, why, and who it is shared with.',
    sections: [
      {
        heading: 'What we collect',
        paragraphs: [
          'Account data: your student email, display name, campus, optional photo and bio, and the version of the Terms you accepted.',
          'Ride data: rides you post or request, seat counts, prices, pickup details you type, messages you send in the app, ratings and reviews, and reports you file.',
          'Payment data: Stripe stores your card and payout details. Beep Me stores only Stripe identifiers, amounts, and payment status, never card numbers.',
          'Device and usage data: crash reports (Sentry) and product analytics events such as sign-up, ride posted, and seat requested (PostHog), tied to your account id rather than your email.',
        ],
      },
      {
        heading: 'How we use it',
        paragraphs: [
          'To run the marketplace, show your campus feed, connect you with other students, process payments and payouts, send transactional email, keep the platform safe, and improve the product.',
        ],
      },
      {
        heading: 'Who sees it',
        paragraphs: [
          'Other verified students on your campus see your display name, photo, bio, rating, and the rides you post. Riders and drivers on the same booking see each other’s messages. Your email address is never shown to other students.',
          'Service providers that process data for us: Supabase (database and authentication), Stripe (payments), RevenueCat (subscriptions), PostHog (analytics), Sentry (crash reporting), and Resend (email). We do not sell personal data.',
          'We disclose information when the law requires it or when needed to address a safety concern or a report.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'You can edit your profile at any time and delete your account from Help and safety; deletion removes your profile and content, except records we must keep for payments, disputes, or legal obligations.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: ['Questions about privacy: support@beepme.app.'],
      },
    ],
  },
  guidelines: {
    slug: 'guidelines',
    title: 'Community Guidelines',
    updated: 'October 29, 2026',
    intro: 'Beep Me works because students trust each other. These rules keep it that way.',
    sections: [
      { heading: 'Be who you say you are', paragraphs: ['Use your real name and a photo of yourself. One account per person. Never share your login code.'] },
      { heading: 'Show up', paragraphs: ['Honor accepted bookings. If plans change, cancel in the app as early as you can so the seat can go to someone else.'] },
      { heading: 'Drive safely', paragraphs: ['No phone in hand, no alcohol or drugs, seat belts for everyone, no more passengers than belts.'] },
      { heading: 'Keep it respectful', paragraphs: ['No harassment, discrimination, threats, or unwanted advances, in the car or in chat. No sharing of another student’s personal information.'] },
      { heading: 'Keep it on the platform', paragraphs: ['Arrange and pay for rides through the app. Off-app payments are not protected and void the cancellation and refund policy.'] },
      { heading: 'Report problems', paragraphs: ['Use Report on a ride or profile, or email support@beepme.app. In an emergency call 911.'] },
    ],
  },
};
