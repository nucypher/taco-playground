# TACo Playground

A visual interface for building and testing Threshold Access Control conditions.

## Features

- Visual block-based condition builder
- Live JSON/API preview
- Encryption and decryption testing
- Support for multiple condition types:
  - Time-based conditions
  - ERC20 token balance
  - ERC721 token ownership
  - Native token (ETH) balance
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
