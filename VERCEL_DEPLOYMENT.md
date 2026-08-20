# Vercel deployment

1. Push this project to a private Git repository, then import it into Vercel. Vercel detects `server.js` as the Express entry point and serves `public/` files from its CDN.
2. Create a managed MySQL database. A MySQL server running on your computer is not reachable from Vercel.
3. Import `db_setup.sql` into that database.
4. In **Vercel → Project → Settings → Environment Variables**, add every value from `.env.example` with the values from your production providers. Do not upload `.env`.
   Set `APP_URL` to your final address, for example `https://your-project.vercel.app`.
5. Deploy, then open `/api/trainers`, `/api/plans`, and `/api/products` on the deployed domain to verify the database connection.

## First administrator

Register your administrator account first, then set its role in the database provider's SQL console:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

Log out and back in after that update so the account receives an administrator session token. All administrator APIs are protected; changing only browser local storage no longer grants access.

## Image uploads

The existing images are included under `public/uploads/` and remain available at `/uploads/<file>`. Create a **Vercel Blob** store attached to this project before using administrator file uploads. Vercel adds `BLOB_READ_WRITE_TOKEN` to the project environment; the application uses it for persistent image uploads.
