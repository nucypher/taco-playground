# TACo Playground

A visual interface for building and testing Threshold Access Control conditions.

## Features

- Visual block-based condition builder
- Live JSON preview
- Encryption and decryption testing
- Support for multiple condition types:
  - Time-based conditions
  - ERC20 token balance
  - ERC721 token ownership
  - ERC1155 token balance
  - Native token (ETH) balance
  - Custom contract calls
  - Compound conditions (AND/OR)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Building for Production

This project is configured to build as a static site, which can be deployed to any static hosting service.

```bash
# Build the static site
npm run build

# The static site will be generated in the 'out' directory
```

## Deployment

After building, the contents of the `out` directory can be deployed to any static hosting service. Here are some examples:

### GitHub Pages

1. Push the repository to GitHub
2. Enable GitHub Pages in your repository settings
3. Set the source to the `gh-pages` branch
4. Run these commands to deploy:

```bash
# Create and switch to gh-pages branch
git checkout -b gh-pages

# Build the static site
npm run build

# Add the out directory to git
git add out/ -f

# Commit the changes
git commit -m "Deploy to GitHub Pages"

# Push to GitHub
git push origin gh-pages
```

### Netlify/Vercel

1. Connect your repository to Netlify/Vercel
2. Set the build command to `npm run build`
3. Set the publish directory to `out`

## Environment Variables

When deploying to a subdirectory (like GitHub Pages), you may need to set the base path. Create a `.env.local` file:

```env
NEXT_PUBLIC_BASE_PATH=/your-repo-name
```

## Notes

- The site requires a Web3 wallet (like MetaMask) to function
- Supported networks: Ethereum, Polygon, Polygon Amoy, Sepolia
- All encryption/decryption happens client-side
- No server-side functionality is required
