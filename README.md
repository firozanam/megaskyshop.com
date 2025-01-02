# Megaskyshop E-commerce

This is an e-commerce website for Megaskyshop using Next.js with App Router, MongoDB, Tailwind CSS, and ShadCN UI.

## Features

- Product management (CRUD operations)
- Shopping cart functionality
- User authentication and authorization
- Order management for both users and admins
- Product reviews and ratings
- Pagination for product listings
- Search functionality
- Admin dashboard with basic statistics
- Detailed order tracking

## Prerequisites

- Node.js (v14 or later)
- MongoDB

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/megaskyshop-ecommerce.git
   cd megaskyshop-ecommerce
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env.local.example` file to `.env.local`
   - Fill in the required environment variables in `.env.local`
   - Make sure to set the following environment variables:
     - `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob storage read/write token

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

To deploy this project, follow these steps:

1. Build the project:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Troubleshooting

If you encounter any of the following issues:

1. "price is not defined" error:
   - Ensure that you're properly extracting the price from your product data in the edit product page.

2. Recursion errors:
   - Check for circular dependencies in your components.
   - Verify that useEffect hooks have proper dependency arrays.
   - Review any recursive functions for proper base cases.

3. Vercel Blob token error:
   - Make sure to set the `BLOB_READ_WRITE_TOKEN` in your environment variables.
   - Pass the token when using Vercel Blob functions in your code.

For more detailed troubleshooting, please refer to the error messages in your browser console or server logs.

## File Management

This project uses Vercel Blob for file storage. To manage files:

1. Ensure the `BLOB_READ_WRITE_TOKEN` is set in your environment variables.
2. The file manager uses a server-side API route (`/api/files`) to securely fetch and manage files.
3. Make sure the API route has the necessary permissions to access Vercel Blob.

If you encounter issues with file management, check the following:

- Verify that the `BLOB_READ_WRITE_TOKEN` is correctly set in your environment variables.
- Ensure that the API route (`app/api/files/route.js`) is properly configured and can access the environment variables.
- Check the server logs for any errors related to Vercel Blob access or token issues.

```
tree -L 5 -I 'node_modules|.next|.git'
```