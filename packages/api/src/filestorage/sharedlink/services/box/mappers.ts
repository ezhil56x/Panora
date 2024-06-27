import { BoxSharedLinkInput, BoxSharedLinkOutput } from './types';
import {
  UnifiedSharedLinkInput,
  UnifiedSharedLinkOutput,
} from '@filestorage/sharedlink/types/model.unified';
import { ISharedLinkMapper } from '@filestorage/sharedlink/types';
import { Utils } from '@filestorage/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';
import { UnifiedPermissionOutput } from '@filestorage/permission/types/model.unified';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class BoxSharedLinkMapper implements ISharedLinkMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'sharedlink',
      'box',
      this,
    );
  }

  async desunify(
    source: UnifiedSharedLinkInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<BoxSharedLinkInput> {
    return;
  }

  async unify(
    source: BoxSharedLinkOutput | BoxSharedLinkOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedSharedLinkOutput | UnifiedSharedLinkOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleSharedLinkToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of BoxSharedLinkOutput
    return Promise.all(
      source.map((sharedlink) =>
        this.mapSingleSharedLinkToUnified(
          sharedlink,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleSharedLinkToUnified(
    sharedlink: BoxSharedLinkOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedSharedLinkOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = sharedlink[mapping.remote_id];
      }
    }
    let opts = {};
    if (sharedlink.parent_folder_remote_id) {
      // we might find a comment id tied to it
      const id_folder = await this.utils.getFolderIdFromRemote(
        sharedlink.parent_folder_remote_id,
        connectionId,
      );
      if (id_folder) {
        opts = {
          folder_id: id_folder,
        };
      }
    }
    if (sharedlink.parent_file_remote_id) {
      // we might find a comment id tied to it
      const id_file = await this.utils.getFileIdFromRemote(
        sharedlink.parent_file_remote_id,
        connectionId,
      );
      if (id_file) {
        opts = {
          file_id: id_file,
        };
      }
    }

    return {
      remote_id: null, // todo null value in sync
      url: sharedlink.url || null,
      download_url: sharedlink.download_url || null,
      scope: sharedlink.access,
      password_protected: sharedlink.is_password_enabled,
      password: null,
      field_mappings,
      ...opts,
      //remote_created_at: sharedlink.created_at || null,
      //remote_modified_at: sharedlink.modified_at || null,
    };
  }
}
