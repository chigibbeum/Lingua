/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    interface Locals {
      uid: string | null
      user: import('$lib/server/auth/session').ServerUserProfile | null
      settings: import('$lib/server/auth/session').ServerUserSettings | null
    }
  }
}

export {}
