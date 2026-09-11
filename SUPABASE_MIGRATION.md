# Supabase Migration

This branch starts the Supabase migration from the stable SIH26001 prototype checkpoint.

## Baseline

- ML risk prediction integrated with the GIS dashboard
- Backend-controlled Python ML inference
- Location-based ML prediction endpoint
- Vite development server configured for `localhost:5175`
- Production build verified successfully

## Migration Plan

1. Create a dedicated Supabase project.
2. Migrate the existing PostgreSQL schema.
3. Migrate the existing project data.
4. Update backend database configuration.
5. Verify all existing APIs.
6. Verify ML prediction and GIS functionality.
7. Run the production build and end-to-end tests.
