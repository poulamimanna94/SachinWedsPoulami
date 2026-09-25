# Poulami & Sachin Wedding Invitation

## Shared wedding photos

This version uses Supabase so guests can upload photos from a phone or computer and see the shared gallery. Each guest can delete only photos uploaded by their own anonymous guest account.

### Supabase setup (required once)

1. Open your Supabase project.
2. Go to **Authentication -> Providers** and turn **Anonymous Sign-Ins** ON.
3. Open **SQL Editor -> New query**.
4. Copy and run the complete `supabase/schema.sql` file from this project.
5. In the project root, create `.env` with:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Keep these existing values unchanged because they power the live photo gallery and the YouTube Edge Function will be deployed to this same Supabase project.

6. Restart Vite after changing `.env`.

### Direct YouTube song search

Users can type only a song name and click **Play Song**. The app calls the `youtube-search` Supabase Edge Function, which searches YouTube and loads the first embeddable result in the page. The YouTube API key is stored only as a Supabase secret, never in the React app.

#### 1. Create the Google API key

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a Google Cloud project.
3. Open **APIs & Services -> Library**.
4. Search for **YouTube Data API v3** and click **Enable**.
5. Open **APIs & Services -> Credentials**.
6. Click **Create Credentials -> API key**.
7. Copy the key. Do not put it in the React `.env` file.

#### 2. Install and log in to Supabase CLI

Install the Supabase CLI using one of these Windows options:

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Then log in:

```powershell
npx supabase login
```

#### 3. Link this project

The project reference is the part before `.supabase.co` in your Supabase URL. For example, for `https://abc123.supabase.co`, the reference is `abc123`.

Run this from the project root:

```powershell
npx supabase link --project-ref YOUR_PROJECT_REF
```

#### 4. Store the key securely in Supabase

```powershell
npx supabase secrets set YOUTUBE_API_KEY=YOUR_GOOGLE_YOUTUBE_DATA_API_KEY
```

#### 5. Deploy the search function

```powershell
npx supabase functions deploy youtube-search
```

The function in `supabase/functions/youtube-search/index.ts` will now search YouTube without exposing the API key to website visitors.

#### 6. Start the website

```bash
npm run dev
```

Open the local URL shown by Vite, type a song name, and click **Play Song**. The first embeddable YouTube result will play inside the page.

### Run locally

```bash
npm install
npm run dev
```

### If photo upload still fails

The page now shows the exact Supabase error under **Add Your Photo**. The two most common causes are:

- **Anonymous Sign-Ins are disabled** -> enable them under Authentication -> Providers.
- **The SQL setup has not been run** -> run `supabase/schema.sql` completely.

Never put a Supabase `sb_secret_...` or `service_role` key in this React app. Use only the publishable key.
