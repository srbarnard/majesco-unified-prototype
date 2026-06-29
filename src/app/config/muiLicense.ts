import { LicenseInfo } from '@mui/x-license'

const licenseKey = import.meta.env.VITE_MUI_X_LICENSE_KEY

if (licenseKey) {
  LicenseInfo.setLicenseKey(licenseKey)
}
