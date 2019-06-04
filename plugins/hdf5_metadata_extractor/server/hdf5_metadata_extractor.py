

import os
import six
# Six: Python 2 and 3 Compatibility Library. Six provides simple utilities for wrapping over differences between Python 2 and Python 3. more details: https://pythonhosted.org/six/ 

from hachoir_core.error import HachoirError
from hachoir_metadata import extractMetadata
from hachoir_parser import createParser
from girder.models.item import Item

import h5py


class MetadataExtractor(object):
    def __init__(self, path, itemId):
        """
        Initialize the metadata extractor.

        :param path: path of file from which to extract metadata on client or
        server
        :param itemId: item ID of item containing file on server
        """
        self.itemId = itemId
        self.path = path
        self.metadata = None

    def extractMetadata(self):
        """
        Extract metadata from file on client or server and attach to item on
        server.
        """
        self._extractMetadata()

        if self.metadata is not None:
            print("not metadata, id %s", self.itemId)
            self._setMetadata()

    def _extractMetadata(self):
        """
        Extract metadata from file on client or server
        If this file is in hdf5 format, then we extract the metadata through h5py
        Otherwise, proceed with the typical hachoir-metadata provided
        """
        try:
            h5f = h5py.File(self.path,'r')
            self.metadata = dict(zip(list(h5f.attrs), list(h5f.attrs.values())))
            
        except:
            try:
                parser = createParser(six.text_type(self.path), six.binary_type(self.path))

                if parser is None:
                    raise HachoirError('no parser')

                extractor = extractMetadata(parser)

                if extractor is None:
                    raise HachoirError('no extractor')

                self.metadata = dict()

                for data in sorted(extractor):
                    if not data.values:
                        continue

                    key = data.description
                    value = ', '.join([item.text for item in data.values])
                    self.metadata[key] = value

            except HachoirError:
                self.metadata = None
        


    def _setMetadata(self):
        """
        Attach metadata to item on server.
        """
        pass


class ClientMetadataExtractor(MetadataExtractor):
    def __init__(self, client, path, itemId):
        """
        Initialize client metadata extractor.

        :param client: client instance
        :param path: path of file from which to extract metadata on remote
        client
        :param itemId: item ID of item containing file on server
        """
        super(ClientMetadataExtractor, self).__init__(path, itemId)
        self.client = client

    def _setMetadata(self):
        """
        Attach metadata to item on server.
        """
        super(ClientMetadataExtractor, self)._setMetadata()
        self.client.addMetadataToItem(str(self.itemId), self.metadata)


class ServerMetadataExtractor(MetadataExtractor):
    def __init__(self, assetstore, uploadedFile):
        """
        Initialize server metadata extractor.

        :param assetstore: asset store containing file
        :param uploadedFile: file from which to extract metadata
        """
        path = os.path.join(assetstore['root'], uploadedFile['path'])
        super(ServerMetadataExtractor, self).__init__(path, uploadedFile['itemId'])
        self.userId = uploadedFile['creatorId']

    def _setMetadata(self):
        """
        Attach metadata to item on server.

        """
        super(ServerMetadataExtractor, self)._setMetadata()
        item = Item().load(self.itemId, force=True)
        Item().setMetadata(item, self.metadata)
