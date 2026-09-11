import { InjectionToken } from '@angular/core';
import type Keycloak from 'keycloak-js';

export const KEYCLOAK = new InjectionToken<Keycloak>('KEYCLOAK');
