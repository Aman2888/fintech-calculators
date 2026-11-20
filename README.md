# Fintech Calculators

A modern and user-friendly financial calculator platform designed to help users make smarter financial decisions.

## Features

- Loan Calculator
- Loan Payment Calculator
- Loan Interest Calculator
- Loan Amortization Calculator
- Auto Loan Calculator
- HELOC Calculator
- Compound Interest Calculator
- Multiple currency display options
- Responsive design for desktop, tablet, and mobile
- Interactive financial calculations and visualizations

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Aman2888/fintech-calculators.git
   ```

2. Navigate to the project directory:

   ```bash
   cd fintech-calculators
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure environment variables.

   If your project uses the Gemini API, create a `.env.local` file in the root directory and add:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open your browser and visit:

   `http://localhost:3000`

## Build for Production

Build with the final public HTTPS origin and run the production server.

```bash
SITE_URL=https://your-domain.example npm run build
npm start
```

The build prerenders the home page, each calculator, the guide, informational pages and a 404 page into `dist/`. It generates the canonical URLs and sitemap from the same route list. Builds without `SITE_URL` carry `noindex` and omit the sitemap. The production server returns 404 for unknown routes, redirects known case, trailing-slash and index-file aliases to their canonical paths, and caches hashed assets. Serve it behind a host or reverse proxy with a valid TLS certificate and an HTTP-to-HTTPS and alternate-host redirect. On static hosting, configure extensionless route resolution and serve `404.html` with HTTP 404 rather than enabling a catch-all SPA rewrite. Add explicit HTTP 301 mappings when replacing live routes and use 410 for intentionally removed pages that have no replacement.

### Search launch checks

- Verify the public domain in Google Search Console and Bing Webmaster Tools. Submit `/sitemap.xml` in both accounts. Inspect the homepage and each calculator URL to confirm HTTP 200, crawlability and the selected canonical.
- Run mobile PageSpeed Insights for the home page and representative calculators. Use field data when available and track LCP at or below 2.5 seconds, INP at or below 200 milliseconds and CLS at or below 0.1. Check desktop and mobile layouts, focus order, keyboard controls and internal links after deployment.
- Monitor indexing errors and organic impressions, clicks, CTR, queries and landing pages. Use the search query data to refine the topic map and examples. Initial topics follow the tools’ actual purposes: fixed payments, payment splits, total interest, extra principal and payoff schedules, auto financing, HELOC payment modes and compound growth.
- Review examples and lender-specific assumptions before changing calculator defaults. Keep key explanations visible in HTML and align structured data with page content.

## Project Structure

```text
fintech-calculators/
├── public/
├── src/
├── .env.local
├── package.json
├── README.md
└── ...
```

## Security

- Keep API keys and sensitive credentials private.
- Never commit `.env.local` to GitHub.
- Use environment variables for sensitive configuration.

## License

This project is available for personal and educational use.

### Keyword map

Search volume and keyword difficulty come from the supplied research. The page targets follow the goal of each tool.

| Primary or supporting query | Target |
| --- | --- |
| loan calculator | `/calculators/loan-calculator` |
| loan payment calculator | `/calculators/loan-payment-calculator` |
| loan amortization calculator | `/calculators/loan-amortization-calculator` |
| loan interest calculator | `/calculators/loan-interest-calculator` |
| vehicle loan calculator, loan calculator auto, car loan, car loans, auto finance calculator, vehicle finance calculator | `/calculators/auto-loan-calculator` |
| HELOC loan calculator | `/calculators/heloc-calculator` |
| auto loan rates, 2nd hand car loan rate, auto loan pre approval, used car finance rates, auto finance | `/guides#car-loans` |
| home equity loan | `/guides#home-equity` |
| title loans, title loan, student loan forgiveness for students, FHA loans for first time buyers, hardship loans, refinance mortgage loan, loan places | Separate search intent. These would require dedicated, sourced coverage or a matching tool before becoming page targets. |
