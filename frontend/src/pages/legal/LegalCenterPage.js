import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiShield, FiFileText, FiRefreshCcw, FiArrowLeft, FiInfo, FiSliders } from 'react-icons/fi';
import Seo from '../../components/common/Seo';

const LEGAL_SEO = {
  privacy: { path: '/privacy', title: 'Privacy Policy | DHotels24.in', description: 'How DHotels24.in collects, uses and protects your personal data when you use our hospitality marketplace.' },
  terms: { path: '/terms', title: 'Terms of Service | DHotels24.in', description: 'The terms and conditions that govern use of the DHotels24.in hospitality marketplace, listings and services.' },
  cookies: { path: '/cookies', title: 'Cookies Policy | DHotels24.in', description: 'How DHotels24.in uses cookies and similar technologies, and how you can manage your cookie preferences.' },
  refund: { path: '/refund-policy', title: 'Refund Policy | DHotels24.in', description: 'Refund terms for payments made on the DHotels24.in hospitality marketplace, including contact access purchases.' }
};

const LegalCenterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab based on URL path
  const getInitialTab = () => {
    if (location.pathname.includes('/terms')) return 'terms';
    if (location.pathname.includes('/cookies') || location.pathname.includes('/cookie-policy')) return 'cookies';
    if (location.pathname.includes('/refund-policy')) return 'refund';
    return 'privacy';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeHeading, setActiveHeading] = useState('section-0');

  // Sync tab with URL if user navigates back/forward
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'privacy') navigate('/privacy');
    else if (tab === 'terms') navigate('/terms');
    else if (tab === 'cookies') navigate('/cookies');
    else if (tab === 'refund') navigate('/refund-policy');
  };

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: FiShield },
    { id: 'terms', label: 'Terms of Service', icon: FiFileText },
    { id: 'cookies', label: 'Cookies Policy', icon: FiSliders },
    { id: 'refund', label: 'Refund Policy', icon: FiRefreshCcw }
  ];

  const executiveSummaries = {
    privacy: [
      'Data Scope: Details the personal data, contact information, and technical identifiers we process.',
      'Lawful Purposes: Outlines processing purposes including enquiry handling, advisory services, security, and statutory compliance.',
      'Protected Sharing: Data is never sold; disclosures are strictly limited to authorized partners, advisers, and legal authorities.',
      'User Rights: Explains your legal rights regarding data access, correction, consent withdrawal, and grievance redressal.'
    ],
    terms: [
      'Binding Agreement: Outlines legal conditions governing your access and use of dhotels24.in.',
      'Informational Purpose: Content provides general market data and does not constitute formal advisory or commitment.',
      'Acceptable Use: Prohibits unlawful access, scraping, malware distribution, or misrepresentation.',
      'Liability & Indemnity: Limits liability to statutory extent and governs legal relationships under Mumbai courts.'
    ],
    cookies: [
      'Mechanism: Explains what cookies and tracking technologies are deployed across dhotels24.in.',
      'Categories: Details essential, functional, analytical/performance, and advertising cookies.',
      'User Autonomy: Provides mechanisms to accept, decline, or configure preferences anytime.',
      'Statutory Protection: Personal data collected via cookies is processed under DPDP Act, 2023 & IT Rules.'
    ],
    refund: [
      'Finality: Payments for unlocking contacts or premium listings are final once details are successfully delivered.',
      'Technical Failure: Refunds are granted for duplicate deductions or system failures delivering target data.',
      'Timeline: Approved refunds will show on the original payment method statement within 5 to 7 business days.'
    ]
  };

  const content = {
    privacy: {
      subtitle: 'DATA PRIVACY & GOVERNANCE',
      title: 'Privacy Policy',
      lastUpdated: 'September 12, 2026',
      sections: [
        {
          title: 'Scope & Preamble',
          body: 'Dhumavati Consulting LLP (“Dhumavati”, “we”, “us” or “our”) respects your privacy and is committed to appropriately protecting personal data entrusted to us.\n\nThis Privacy Policy (“Policy”) explains how we collect, use, disclose, store and otherwise process personal data when you access or use https://dhotels24.in/ (“Website”), communicate with us through the Website or otherwise interact with us in connection with the Website.\n\nThis Policy applies to personal data processed by us in connection with the Website. It does not necessarily apply to personal data processed pursuant to a separate engagement, mandate or contractual relationship with Dhumavati where such processing is governed by separate contractual terms or notices.'
        },
        {
          title: 'Personal Data We May Collect',
          body: 'Depending upon your interaction with us, we may collect:\n\n(a) your name;\n(b) email address;\n(c) telephone or mobile number;\n(d) information contained in your enquiry or correspondence with us;\n(e) information relating to your organisation or business, where voluntarily provided;\n(f) technical information concerning your device, browser and interaction with the Website;\n(g) IP address and similar technical identifiers; and\n(h) information collected through cookies and similar technologies.\n\nWe do not seek to collect personal data that is unnecessary for the relevant purpose.'
        },
        {
          title: 'How We Collect Personal Data',
          body: 'We may collect personal data:\n\n(a) directly from you when you submit an enquiry or request a callback;\n(b) when you communicate with us;\n(c) automatically through your use of the Website, including through cookies and similar technologies; and\n(d) from third parties where permitted by applicable law and reasonably necessary for a legitimate business purpose.'
        },
        {
          title: 'Purposes of Processing',
          body: 'We may process personal data for purposes including:\n\n(a) responding to enquiries;\n(b) contacting you following a callback request;\n(c) understanding your requirements and determining whether we may be able to assist you;\n(d) providing or arranging requested Services;\n(e) communicating with you concerning our Services;\n(f) maintaining and administering the Website;\n(g) improving Website functionality, security and performance;\n(h) preventing fraud, misuse and security incidents;\n(i) maintaining business and administrative records;\n(j) complying with applicable legal and regulatory requirements;\n(k) establishing, exercising or defending legal rights; and\n(l) such other purposes as may be notified to you at the time of collection or otherwise permitted by applicable law.'
        },
        {
          title: 'Consent',
          body: 'Where processing is based on consent, we will seek consent in accordance with applicable law. Where permitted by applicable law, processing may also be undertaken where necessary for another lawful purpose, including compliance with legal obligations, performance of a contract or taking steps at your request prior to entering into a contract.\n\nWhere you provide information voluntarily through the Website, you are responsible for ensuring that the information provided is accurate and that you have the necessary authority to provide any information relating to another individual.'
        },
        {
          title: 'Communications',
          body: 'If you submit an enquiry or request a callback, we may contact you using the details provided by you for the purpose of responding to that enquiry. Any marketing or promotional communications will be undertaken in accordance with applicable law and your applicable preferences.\n\nYou may request cessation of promotional communications at any time through the mechanism made available in the relevant communication or by contacting us.'
        },
        {
          title: 'Cookies and Similar Technologies',
          body: 'We use cookies and similar technologies for purposes including Website functionality, security, preferences, analytics and, where applicable, advertising or campaign measurement. Further information concerning the categories of cookies, their purposes and your choices is contained in our Cookies Policy.'
        },
        {
          title: 'Disclosure of Personal Data',
          body: 'We may disclose personal data, where reasonably necessary, to:\n\n(a) our employees, partners and authorised personnel;\n(b) technology, hosting, website maintenance and IT service providers;\n(c) analytics and communication service providers;\n(d) professional advisers and consultants;\n(e) transaction counterparties or service providers where necessary and permitted in connection with a specific engagement;\n(f) governmental, regulatory, judicial or law-enforcement authorities where required or permitted by law; and\n(g) other persons where disclosure is authorised by you or permitted by applicable law.\n\nWe seek to ensure that third-party service providers processing personal data on our behalf are subject to appropriate contractual and confidentiality obligations.'
        },
        {
          title: 'Data Security',
          body: 'We take reasonable technical and organisational measures appropriate to the nature of personal data processed by us to protect it against unauthorised access, loss, misuse, alteration, disclosure or destruction.\n\nHowever, no electronic system or transmission over the internet can be guaranteed to be completely secure.'
        },
        {
          title: 'Data Retention',
          body: 'We retain personal data only for so long as reasonably necessary for the purpose for which it was collected, to fulfil our contractual or legal obligations, establish or defend legal claims, maintain appropriate business records or otherwise as permitted or required by applicable law. Retention periods may vary depending upon the nature and purpose of the information.'
        },
        {
          title: 'International Transfers',
          body: 'Certain technology or service providers engaged by us may process information from locations outside India. Where personal data is transferred outside India, such transfer will be undertaken in accordance with applicable law and subject to applicable restrictions and safeguards.'
        },
        {
          title: 'Your Rights',
          body: 'Subject to applicable law, you may have rights in relation to your personal data, including rights to:\n\n(a) obtain information regarding processing;\n(b) request correction of inaccurate or incomplete personal data;\n(c) request erasure of personal data where legally applicable;\n(d) withdraw consent where processing is based on consent; and\n(e) raise a grievance concerning processing of your personal data.\n\nRequests may be made using the contact details provided below. We may require reasonable information to verify the identity and authority of the person making a request.'
        },
        {
          title: 'Withdrawal of Consent',
          body: 'Where processing is based on your consent, you may withdraw your consent by contacting us or using the relevant consent-management mechanism made available on the Website. Withdrawal of consent shall not affect the lawfulness of processing undertaken before withdrawal.\n\nWithdrawal may also mean that we are unable to provide certain functionality, respond to a particular request or provide a particular service where such processing is necessary for that purpose.'
        },
        {
          title: 'Children',
          body: 'The Website is not intended to knowingly solicit personal data from children in circumstances where parental or verifiable consent is required under applicable law. If you believe that personal data relating to a child has been provided to us contrary to applicable law, please contact us so that we may take appropriate steps.'
        },
        {
          title: 'Third-Party Websites',
          body: 'The Website may contain links to third-party websites. This Policy does not apply to those websites. We recommend reviewing the privacy policies of third parties before providing them with personal data.'
        },
        {
          title: 'Grievance Redressal',
          body: 'If you have a question, concern or grievance regarding the processing of your personal data, you may contact us using the contact details below. We will endeavour to address your grievance within the period prescribed by applicable law.'
        },
        {
          title: 'Changes to This Policy',
          body: 'We may amend this Policy from time to time to reflect changes in our practices, technology, Services or applicable law. The revised Policy will be published on the Website with an updated “Last Updated” date.'
        },
        {
          title: 'Contact Information',
          body: 'Dhumavati Consulting LLP\nFor privacy-related queries, requests or grievances, please use the contact details provided on the Website.\nWebsite: https://dhotels24.in/'
        }
      ]
    },
    terms: {
      subtitle: 'PLATFORM GOVERNANCE & LEGAL TERMS',
      title: 'Terms and Conditions',
      lastUpdated: 'September 12, 2026',
      sections: [
        {
          title: 'Scope & Acceptance',
          body: 'These Terms and Conditions (“Terms”) govern your access to and use of the website https://dhotels24.in/ and all pages, content, features and functionalities made available through it (collectively, the “Website”).\n\nThe Website is operated by Dhumavati Consulting LLP (“Dhumavati”, “we”, “us” or “our”).\n\nBy accessing, browsing or using the Website, you acknowledge that you have read, understood and agreed to be bound by these Terms. If you do not agree with these Terms, you should discontinue your use of the Website.'
        },
        {
          title: 'Definitions',
          body: 'In these Terms:\n\n“Content” means all text, information, articles, graphics, photographs, illustrations, logos, videos, materials, data and other content made available through the Website.\n\n“Services” means any advisory, consulting, financing, transaction-support, M&A, capital-raising or other services that may be offered by Dhumavati, whether through the Website or otherwise.\n\n“User”, “you” or “your” means any person accessing or using the Website.'
        },
        {
          title: 'Nature of the Website',
          body: '2.1 The Website is intended to provide information concerning Dhumavati and its activities, capabilities, areas of expertise and potential transaction or advisory opportunities.\n\n2.2 The Website may contain information relating to financing, acquisition finance, technology funding, cross-border capital, mergers and acquisitions and other corporate or financial matters.\n\n2.3 Nothing contained on the Website shall, by itself, constitute an offer, invitation, solicitation, recommendation, commitment or undertaking by Dhumavati to provide any particular Service or enter into any transaction.\n\n2.4 Any engagement of Dhumavati for Services shall be subject to separate written terms, engagement documentation or definitive transaction documents, as applicable.'
        },
        {
          title: 'Access and Acceptable Use',
          body: '3.1 You may access and use the Website solely for lawful purposes specified.\n\n3.2 You shall not:\n(a) use the Website in violation of any applicable law or regulation;\n(b) attempt to gain unauthorised access to any part of the Website or its systems;\n(c) interfere with or disrupt the operation, security or integrity of the Website;\n(d) introduce any virus, malware, malicious code or other harmful material;\n(e) scrape, crawl, reproduce or systematically extract Website Content except with our prior written consent;\n(f) use the Website for any fraudulent, misleading or unlawful purpose; or\n(g) represent that you have an association, affiliation or relationship with Dhumavati which does not exist.'
        },
        {
          title: 'Website Content',
          body: '4.1 We endeavour to ensure that Content published on the Website is reasonably accurate and current. However, Content may contain errors, omissions, inaccuracies or information that becomes outdated.\n\n4.2 We do not warrant that the Website or its Content will at all times be complete, accurate, current, uninterrupted or error-free.\n\n4.3 We reserve the right to modify, update, suspend or discontinue any part of the Website or Content at any time without notice.\n\n4.4 Content is provided for general informational purposes and should not be relied upon as a substitute for independent professional advice or due diligence.'
        },
        {
          title: 'No Professional Advice',
          body: '5.1 Nothing on the Website constitutes legal, tax, accounting, financial, investment, securities, valuation or other professional advice.\n\n5.2 You should obtain appropriate professional advice having regard to your particular circumstances before making any financial, investment, acquisition, financing or other decision.\n\n5.3 No person should act or refrain from acting solely on the basis of information contained on the Website.'
        },
        {
          title: 'Enquiries and Callback Requests',
          body: '6.1 The Website may permit Users to submit enquiries or request a callback by providing information such as their name, email address and telephone number.\n\n6.2 Submission of an enquiry does not create an adviser-client relationship, fiduciary relationship, contractual relationship or obligation on Dhumavati to provide any Service.\n\n6.3 Dhumavati may contact you in response to an enquiry or request for information, subject to applicable law.\n\n6.4 Personal information submitted through the Website will be handled in accordance with our Privacy Policy.'
        },
        {
          title: 'Intellectual Property',
          body: '7.1 All intellectual property rights in the Website and its Content, including its design, layout, text, graphics, trademarks, logos, photographs, software and other materials, are owned by or licensed to Dhumavati, unless expressly stated otherwise.\n\n7.2 No right, title or interest in any intellectual property is transferred to you by virtue of your use of the Website.\n\n7.3 You shall not reproduce, modify, distribute, publish, transmit, commercially exploit or create derivative works from any Content without our prior written consent, except to the extent expressly permitted by applicable law.'
        },
        {
          title: 'Third-Party Content and Links',
          body: '8.1 The Website may contain links to third-party websites or references to third-party products, services or information.\n\n8.2 Such links are provided for convenience only and do not constitute an endorsement, recommendation or representation by Dhumavati.\n\n8.3 Dhumavati does not control and is not responsible for the content, security, availability, privacy practices or terms of any third-party website.\n\n8.4 Your access to third-party websites is at your own risk.'
        },
        {
          title: 'Confidential Information',
          body: '9.1 The Website is not intended to provide a secure mechanism for submitting confidential or proprietary information.\n\n9.2 You should not submit confidential, commercially sensitive or proprietary information through the Website unless specifically requested or authorised by Dhumavati.\n\n9.3 Submission of information through the Website shall not, by itself, create an obligation of confidentiality in respect of such information.'
        },
        {
          title: 'Availability and Security',
          body: '10.1 We do not guarantee that the Website will be continuously available or free from interruptions, defects or security vulnerabilities.\n\n10.2 Although we take reasonable measures to maintain the security of the Website, no transmission or electronic storage system can be guaranteed to be completely secure.\n\n10.3 You acknowledge the inherent risks associated with using the internet and electronic communications.'
        },
        {
          title: 'Limitation of Liability',
          body: 'To the maximum extent permitted by applicable law, Dhumavati, its partners, employees, representatives, consultants and service providers shall not be liable for any direct, indirect, incidental, consequential, special or punitive loss or damage arising out of or in connection with:\n\n(a) your access to or use of the Website;\n(b) your reliance on any Content;\n(c) any interruption, suspension or unavailability of the Website;\n(d) any transaction or decision undertaken by you in reliance upon Website Content; or\n(e) any third-party website, content, product or service accessed through the Website.\n\nNothing in these Terms shall exclude or limit liability to the extent such exclusion or limitation is prohibited under applicable law.'
        },
        {
          title: 'Indemnity',
          body: 'You agree to indemnify and hold harmless Dhumavati and its partners, employees, representatives and service providers from and against claims, liabilities, losses, damages, costs and expenses arising from:\n\n(a) your breach of these Terms;\n(b) your unlawful or unauthorised use of the Website;\n(c) your infringement of any third-party rights; or\n(d) any information or material submitted by you through the Website.'
        },
        {
          title: 'Privacy and Cookies',
          body: '13.1 Our collection and processing of personal data is governed by our Privacy Policy.\n\n13.2 Our use of cookies and similar technologies is governed by our Cookies Policy.\n\n13.3 The Privacy Policy and Cookies Policy form an integral part of these Terms.'
        },
        {
          title: 'Suspension or Termination',
          body: 'We may suspend, restrict or terminate your access to the Website where we reasonably consider it necessary to protect the Website, our rights, other Users or comply with applicable law.'
        },
        {
          title: 'Changes to These Terms',
          body: 'We may amend these Terms from time to time. Revised Terms will be published on the Website with the revised “Last Updated” date.\n\nYour continued use of the Website after publication of revised Terms constitutes acceptance of the revised Terms, to the extent permitted by applicable law.'
        },
        {
          title: 'Severability',
          body: 'If any provision of these Terms is held to be unlawful, invalid or unenforceable, such provision shall be severed or modified to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.'
        },
        {
          title: 'Waiver',
          body: 'No failure or delay by Dhumavati in exercising any right or remedy shall constitute a waiver of that right or remedy.'
        },
        {
          title: 'Entire Understanding',
          body: 'These Terms, together with the Privacy Policy, Cookies Policy and Disclaimer, constitute the terms governing your use of the Website, subject to any separate written agreement entered into between you and Dhumavati.\n\nIn the event of any inconsistency between these Terms and a specific written agreement governing Services provided by Dhumavati, the specific written agreement shall prevail in respect of such Services.'
        },
        {
          title: 'Governing Law and Jurisdiction',
          body: 'These Terms shall be governed by and construed in accordance with the laws of India with competent courts of Mumbai having jurisdiction.\n\nSubject to any mandatory provisions of applicable law, the courts having jurisdiction over the relevant dispute shall have exclusive jurisdiction.'
        },
        {
          title: 'Contact Information',
          body: 'For questions concerning these Terms, you may contact Dhumavati Consulting LLP through the contact details provided on the Website.\n\nDhumavati Consulting LLP\nWebsite: https://dhotels24.in/'
        }
      ]
    },
    cookies: {
      subtitle: 'DATA TRANSPARENCY & TRACKING',
      title: 'Cookies Policy',
      lastUpdated: 'September 12, 2026',
      sections: [
        {
          title: 'Scope & Preamble',
          body: 'This Cookies Policy (“Policy”) explains how Dhumavati Consulting LLP (“Dhumavati”, “we”, “us” or “our”) uses cookies and similar technologies when you access or use our website https://dhotels24.in/ (“Website”).\n\nThis Policy should be read together with our Privacy Policy and Terms & Conditions available on the Website. It explains what cookies are, the types of cookies we may use, the purposes for which we use them and the choices available to you in relation to such cookies.\n\nBy continuing to use the Website, you acknowledge the use of cookies in accordance with this Policy, subject to any choices or preferences made by you through the cookie consent mechanism made available on the Website.'
        },
        {
          title: 'What Are Cookies?',
          body: 'Cookies are small text files which are placed on your computer, mobile device or other device when you visit a website. Cookies enable a website to recognise a particular device and may perform various functions, including enabling essential website functionality, remembering preferences, analysing website traffic and improving the user experience.\n\nWe may also use technologies similar to cookies, including pixels, web beacons, tags, scripts and other tracking technologies (“Similar Technologies”). For the purposes of this Policy, cookies and Similar Technologies are collectively referred to as “Cookies”.\n\nCookies generally do not directly identify you. However, certain Cookies, when combined with other information, may be capable of being associated with you or may result in information relating to an identifiable individual being processed. Where such information constitutes personal data under applicable law, we will process it in accordance with our Privacy Policy and applicable data-protection laws.'
        },
        {
          title: 'Types of Cookies We Use',
          body: 'Depending upon their purpose and duration, Cookies used on the Website may include the following:\n\n2.1 Strictly Necessary / Essential Cookies:\nThese Cookies are necessary for the basic operation and security of the Website. They may enable functions such as page navigation, access to secure areas, session management, security and prevention of fraudulent or malicious activity. Because these Cookies are necessary for the operation of the Website, disabling them may affect the availability or functionality of certain features.\n\n2.2 Functional Cookies:\nFunctional Cookies allow the Website to remember information and choices made by you, such as preferences or settings, and provide enhanced and more personalised functionality. Where required by applicable law, such Cookies will only be placed or activated after obtaining your consent.\n\n2.3 Analytical / Performance Cookies:\nThese Cookies help us understand how visitors use the Website, including which pages are visited, how visitors navigate the Website and whether they encounter errors. The information collected through these Cookies may be used to measure Website performance, identify areas for improvement and improve the functionality, content and user experience of the Website. Where applicable, such Cookies may be provided by third-party analytics service providers acting on our behalf.\n\n2.4 Advertising / Targeting Cookies:\nThese Cookies may be used to understand your browsing interests and to deliver, measure or improve advertising and promotional communications which may be relevant to you. Advertising or targeting Cookies may be placed by us or by third-party service providers, advertising networks or other partners. We will seek your consent before using non-essential advertising or targeting Cookies where such consent is required under applicable law.'
        },
        {
          title: 'First-Party and Third-Party Cookies',
          body: 'Some Cookies are placed directly by us (“First-Party Cookies”).\n\nOther Cookies may be placed by third parties whose services, content, analytics tools, advertising technologies or other functionality are incorporated into or made available through the Website (“Third-Party Cookies”).\n\nThird-party providers may process information collected through their Cookies in accordance with their respective privacy policies and terms. We do not control the privacy practices of third parties and recommend that you review their applicable policies before interacting with their services. The actual third-party Cookies deployed on the Website may change from time to time depending upon the services and technologies used by us.'
        },
        {
          title: 'Purposes for Which We Use Cookies',
          body: 'We may use Cookies for one or more of the following purposes:\n\n(a) to enable the Website to operate correctly and securely;\n(b) to maintain user sessions and remember preferences;\n(c) to understand how visitors use and interact with the Website;\n(d) to monitor and improve Website performance;\n(e) to identify technical issues and improve Website security;\n(f) to remember choices and preferences made by visitors;\n(g) to improve the content, functionality and user experience of the Website;\n(h) to measure the effectiveness of communications, campaigns or promotional activities; and\n(i) where applicable and with the requisite consent, to provide, measure or personalise advertising and promotional content.'
        },
        {
          title: 'Cookie Consent and Your Choices',
          body: 'Where required under applicable law, non-essential Cookies will be activated only after obtaining your consent. When you first visit the Website, you may be presented with a cookie banner or consent management mechanism allowing you to:\n\n(a) accept all Cookies;\n(b) reject or disable non-essential Cookies; and/or\n(c) manage your preferences by category.\n\nYou may change or withdraw your consent to the use of non-essential Cookies at any time through the cookie preference mechanism made available on the Website. Withdrawal of consent will not affect the lawfulness of processing carried out before such withdrawal. Please note that if you disable or reject certain Cookies, some features or functionality of the Website may not operate as intended.'
        },
        {
          title: 'Browser Controls',
          body: 'Most web browsers allow you to control or delete Cookies through their settings. You may configure your browser to:\n\n(a) notify you when Cookies are being placed;\n(b) block certain or all Cookies;\n(c) delete Cookies already stored on your device; or\n(d) automatically delete Cookies after closing your browser.\n\nThe manner in which these controls operate varies between browsers and devices. You should refer to the relevant browser or device provider for instructions. Please note that blocking all Cookies may affect the operation and functionality of the Website.'
        },
        {
          title: 'Cookie Duration',
          body: 'Cookies may be either:\n\n7.1 Session Cookies — These Cookies remain on your device only for the duration of your browsing session and are generally deleted when you close your browser; or\n\n7.2 Persistent Cookies — These Cookies remain on your device for a specified period or until they are deleted by you.\n\nThe duration of a particular Cookie may depend upon its purpose and the provider placing the Cookie. We will retain information collected through Cookies only for so long as reasonably necessary for the purposes for which it was collected, or for such period as may be required or permitted under applicable law.'
        },
        {
          title: 'Personal Data Collected Through Cookies',
          body: 'Certain Cookies may collect information such as:\n\n(a) IP address or approximate location;\n(b) browser and device type;\n(c) operating system;\n(d) pages visited and interactions with the Website;\n(e) date, time and duration of visits;\n(f) referring website or source;\n(g) language and other technical preferences; and\n(h) information concerning your use of the Website.\n\nThe nature and extent of information collected will depend upon the Cookies deployed on the Website. Where such information constitutes personal data under applicable law, it will be processed in accordance with our Privacy Policy and applicable data-protection laws.'
        },
        {
          title: 'Sharing of Cookie Information',
          body: 'Information collected through Cookies may, where necessary, be accessible to:\n\n(a) our employees, personnel and authorised representatives;\n(b) technology, hosting, website maintenance, analytics and IT service providers;\n(c) marketing and advertising service providers, where applicable;\n(d) professional advisers and consultants; and\n(e) governmental, regulatory, law-enforcement or other authorities where disclosure is required or permitted by law.\n\nWe expect third-party service providers engaged by us to process information in accordance with applicable contractual and legal requirements.'
        },
        {
          title: 'International Transfers',
          body: 'Certain third-party service providers whose technologies may be used on the Website may process information outside India. Where information collected through Cookies constitutes personal data and is transferred outside India, such transfer will be undertaken in accordance with applicable law and subject to any restrictions, requirements or safeguards that may apply from time to time.'
        },
        {
          title: 'Your Data Protection Rights',
          body: 'Depending upon the applicability of the Digital Personal Data Protection Act, 2023 and other applicable laws, you may have certain rights in relation to your personal data, including rights relating to access to information about processing, correction, erasure and withdrawal of consent, subject to applicable legal requirements and exceptions.\n\nDetails concerning the processing of personal data and the manner in which applicable rights may be exercised are set out in our Privacy Policy. Nothing in this Policy is intended to restrict any right available to you under applicable law.'
        },
        {
          title: 'Children',
          body: 'The Website is not intended to be used by children in circumstances where applicable law requires parental or verifiable consent for processing their personal data. We do not knowingly seek to collect personal data from children in contravention of applicable law.'
        },
        {
          title: 'Changes to This Policy',
          body: 'We may amend or update this Policy from time to time to reflect changes in the Cookies used by us, the functionality of the Website, applicable law, regulatory requirements or our practices. Any revised Policy will be posted on this page with the updated “Last Updated” date.\n\nWe encourage you to review this Policy periodically to remain informed about our use of Cookies.'
        },
        {
          title: 'Contact Us',
          body: 'If you have any questions, concerns or requests relating to this Policy or the use of Cookies on the Website, you may contact us at:\n\nDhumavati Consulting LLP (dhotels24.in)\nEmail: support@dhotels24.in\nTelephone: +91 86558 11111\nBusiness Hours: 10:00 AM to 7:00 PM'
        },
        {
          title: 'Governing Law & Jurisdiction',
          body: 'This Policy shall be governed by and construed in accordance with the laws of India and Jurisdiction of Courts in Mumbai. Any dispute arising out of or in connection with this Policy shall be subject to the jurisdiction of the courts having jurisdiction in accordance with applicable law.'
        }
      ]
    },
    refund: {
      subtitle: 'TRANSACTION POLICY',
      title: 'Refund Policy',
      lastUpdated: 'April 17, 2026',
      sections: [
        {
          title: 'General Refund Guidelines',
          body: 'At dhotels24.in, all payments made for unlocking seller contact details or premium listing features are generally considered final and non-refundable, as the service (delivery of information) is executed immediately upon successful payment.'
        },
        {
          title: 'Exceptions for Refunds',
          body: 'Refunds will only be processed under the following circumstances: (1) A technical failure resulting in duplicate charges for a single transaction. (2) The system fails to provide the purchased contact details after a successful payment deduction.'
        },
        {
          title: 'Refund Process',
          body: 'If you believe you are eligible for a refund due to a technical error, you must contact our support team within 48 hours of the transaction. Please provide your transaction ID, registered email address, and a brief explanation of the issue.'
        },
        {
          title: 'Processing Time',
          body: 'Approved refunds will be processed and credited back to the original method of payment within 5-7 business days, depending on your bank or payment provider\'s processing times.'
        }
      ]
    }
  };

  const activeData = content[activeTab];

  // Track Reading Progress & Scrollspy
  useEffect(() => {
    const handleScroll = () => {
      // Calculate Scroll Progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollPercent((window.scrollY / docHeight) * 100);
      }

      // Calculate Active Section (Scrollspy)
      const sectionElements = activeData.sections.map((_, idx) => document.getElementById(`section-${idx}`));
      
      let currentSectionId = 'section-0';
      for (const el of sectionElements) {
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the element's top is near the top of the viewport, mark it active
          if (rect.top <= 250) {
            currentSectionId = el.id;
          }
        }
      }
      setActiveHeading(currentSectionId);
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger initially
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeData]);

  return (
    <div className="min-h-screen bg-gray-950 bg-mesh relative pb-24 pt-24 text-gray-100" style={{ overflowX: 'clip' }}>
      <Seo
        title={LEGAL_SEO[activeTab].title}
        description={LEGAL_SEO[activeTab].description}
        path={LEGAL_SEO[activeTab].path}
      />
      
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-gray-900 z-50">
        <div 
          className="h-full bg-gradient-to-r from-primary-500 to-primary-500 transition-all duration-100 ease-out shadow-[0_0_8px_rgba(249,115,22,0.4)]" 
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* Decorative glows */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-primary-400 uppercase tracking-widest transition-colors gap-2">
            <FiArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="mb-10 relative p-6 md:p-10 bg-gray-900/40 border border-gray-800/80 rounded-3xl overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
          <span className="text-primary-500 font-extrabold uppercase tracking-widest text-[10px] bg-primary-500/10 px-3.5 py-1 rounded-full border border-primary-500/20">{activeData.subtitle}</span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-100 tracking-tight mt-5 mb-4 leading-none">
            {activeData.title}
          </h1>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-5">
            <span>Last Updated: <strong className="text-gray-300 font-extrabold">{activeData.lastUpdated}</strong></span>
            <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-gray-800" />
            <span>Version: <strong className="text-gray-300 font-extrabold">1.0.0</strong></span>
            <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-gray-800" />
            <span>Read Time: <strong className="text-gray-300 font-extrabold">{Math.ceil(activeData.sections.map(s => s.body.split(' ').length).reduce((a, b) => a + b, 0) / 200)} min read</strong></span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT: Sidebar Documentation Navigation */}
          <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-28">
            <div className="bg-gray-900/45 border border-gray-805 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-3">Legal Center</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <div key={tab.id} className="space-y-1">
                      <button
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 text-xs uppercase tracking-wider ${
                          isActive 
                            ? 'bg-gradient-to-r from-primary-500 to-primary-500 text-white shadow-lg shadow-primary-500/10' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                        }`}
                      >
                        <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary-500'}`} />
                        {tab.label}
                      </button>
                      
                      {/* Nested Headings (Visible only when tab is active) */}
                      {isActive && (
                        <div className="pl-6 pr-2 py-2 space-y-2.5 border-l border-gray-850 ml-6 animate-fadeIn">
                          {activeData.sections.map((section, idx) => {
                            const isHeadingActive = activeHeading === `section-${idx}`;
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  const element = document.getElementById(`section-${idx}`);
                                  if (element) {
                                    const yOffset = -120; // offset for sticky components
                                    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
                                    window.scrollTo({ top: y, behavior: 'smooth' });
                                  }
                                }}
                                className={`block text-left w-full text-[11px] font-bold leading-relaxed transition-all truncate ${
                                  isHeadingActive 
                                    ? 'text-primary-400 pl-1 translate-x-0.5' 
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                              >
                                {idx + 1}. {section.title}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* RIGHT: Document Reader & Details */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Executive Summary Card */}
            <div className="p-6 bg-gradient-to-b from-gray-900/60 to-gray-950/60 border border-gray-805 rounded-3xl shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-500 to-primary-500" />
              <h3 className="text-[10px] font-black text-primary-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <FiInfo className="w-4 h-4 text-primary-500" /> Document Executive Summary
              </h3>
              <ul className="space-y-3 text-gray-300 text-xs md:text-sm font-medium leading-relaxed">
                {executiveSummaries[activeTab].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0 animate-pulse" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Document Main Content Card */}
            <div className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6 md:p-12 shadow-2xl backdrop-blur-md relative overflow-hidden">
              
              {/* Sections */}
              <div className="space-y-12">
                {activeData.sections.map((section, index) => {
                  const sectionNumber = String(index + 1).padStart(2, '0');
                  
                  // Render a callout card for specific key sections to satisfy Requirement 8
                  const isCallout = (activeTab === 'privacy' && section.title.includes('Data Security')) ||
                                    (activeTab === 'terms' && section.title.includes('Limitation of Liability')) ||
                                    (activeTab === 'cookies' && section.title.includes('Cookie Consent')) ||
                                    (activeTab === 'refund' && section.title.includes('Exceptions for Refunds'));
                                    
                  return (
                    <div key={index} id={`section-${index}`} className="group scroll-mt-28 transition-all">
                      {isCallout ? (
                        <div className="p-6 bg-gradient-to-r from-primary-500/5 to-primary-500/5 border border-primary-500/10 rounded-2xl shadow-inner relative overflow-hidden">
                          <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-gradient-to-b from-primary-500 to-primary-500" />
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center font-extrabold text-xs">
                              ⚠️
                            </div>
                            <h2 className="text-base md:text-lg font-black text-primary-400 uppercase tracking-wide">{section.title} (Key Notice)</h2>
                          </div>
                          <div className="pl-12 text-gray-300 text-sm md:text-base leading-relaxed font-medium">
                            <p className="whitespace-pre-line">{section.body}</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center font-black text-sm group-hover:bg-primary-500/20 transition-all duration-300 shadow-sm">
                              {sectionNumber}
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight group-hover:text-primary-400 transition-colors duration-300">{section.title}</h2>
                          </div>
                          <div className="pl-14 text-gray-400 leading-relaxed text-sm md:text-base font-medium space-y-4">
                            <p className="whitespace-pre-line">{section.body}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LegalCenterPage;
