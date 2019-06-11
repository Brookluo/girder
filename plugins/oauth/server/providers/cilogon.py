#!/usr/bin/env python
# -*- coding: utf-8 -*-

###############################################################################
#  Copyright Kitware Inc.
#
#  Licensed under the Apache License, Version 2.0 ( the "License" );
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
###############################################################################

from six.moves import urllib

from girder.api.rest import getApiUrl
from girder.exceptions import RestException
from girder.models.setting import Setting
from .base import ProviderBase
from .. import constants
import json


class CILogon(ProviderBase):
    _AUTH_URL = 'https://cilogon.org/authorize'
    _TOKEN_URL = 'https://cilogon.org/oauth2/token'
    _API_USER_URL = 'https://cilogon.org/oauth2/userinfo'
    _AUTH_SCOPES = ['openid', 'email', 'profile']
    def getClientIdSetting(self):
        return Setting().get(constants.PluginSettings.CILOGON_CLIENT_ID)

    def getClientSecretSetting(self):
        return Setting().get(constants.PluginSettings.CILOGON_CLIENT_SECRET)

    @classmethod
    def getUrl(cls, state):
        clientId = Setting().get(constants.PluginSettings.CILOGON_CLIENT_ID)

        if clientId is None:
            raise Exception('No CILogon client ID setting is present.')

        callbackUrl = '/'.join((getApiUrl(), 'oauth', 'cilogon', 'callback'))
        # TODO here is the format bug that caused the error
        query = urllib.parse.urlencode({
            'response_type': 'code',
            'client_id': clientId,
            'redirect_uri': callbackUrl,
            'state': state,
            'scope': ' '.join(cls._AUTH_SCOPES)
        })
        return '%s?%s' % (cls._AUTH_URL, query)

    def getToken(self, code):
        params = {
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': self.clientId,
            'client_secret': self.clientSecret,
            'redirect_uri': self.redirectUri,
        }

        resp = self._getJson(method='POST', url=self._TOKEN_URL,
                             data=params,
                             headers={'Accept': 'application/json'})

        if 'error' in resp:
            raise RestException(
                'Got an error exchanging token from provider: "%s".' % resp,
                code=502)
        return resp

    def getUser(self, token):
        headers = {
            'Authorization': 'Bearer %s' % token['access_token'],
            'Accept': 'application/json'
        }
        data = {
            'access_token': '%s' % token['access_token']
        }

        # Get user's email address
        resp = self._getJson(method='POST', url=self._API_USER_URL, data=data, headers=headers)
        email = resp.get('email')
        if not email:
            print(resp)
            raise RestException(
                'CILogon did not return user information.', code=502)

        # Get user's OAuth2 ID, login, and name
        # Using the NetID for the oauthID
        oauthId = email.split("@")[0]
        if not oauthId:
            raise RestException('CILOGON did not return a user ID.', code=502)

        firstName = resp.get("given_name")
        lastName = resp.get("family_name")
        return self._createOrReuseUser(oauthId, email, firstName, lastName)
