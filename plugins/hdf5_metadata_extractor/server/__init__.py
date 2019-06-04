
from girder import events
from girder.constants import AssetstoreType

from . hdf5_metadata_extractor import ServerMetadataExtractor


def handler(event):
    if event.info['assetstore']['type'] == AssetstoreType.FILESYSTEM:
        hdf5metadataExtractor = ServerMetadataExtractor(event.info['assetstore'],
                                                    event.info['file'])
        hdf5metadataExtractor.extractMetadata()


def load(info):
    events.bind('data.process', 'hdf5_metadata_extractor_handler', handler)
