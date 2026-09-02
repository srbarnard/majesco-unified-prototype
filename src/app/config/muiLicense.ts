import { LicenseInfo } from '@mui/x-license'

/**
 * Set VITE_MUI_X_LICENSE_KEY in `.env.local` with your MUI X Premium key to
 * remove the grid watermark in production builds.
 */
const licenseKey = import.meta.env.VITE_MUI_X_LICENSE_KEY?.trim()

if (licenseKey) {
  LicenseInfo.setLicenseKey(licenseKey)
}
