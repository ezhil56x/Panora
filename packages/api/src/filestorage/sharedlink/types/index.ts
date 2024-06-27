import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedSharedLinkInput,
  UnifiedSharedLinkOutput,
} from './model.unified';
import { OriginalSharedLinkOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';

export interface ISharedLinkService {
  addSharedLink?(
    sharedlinkData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalSharedLinkOutput>>;

  syncSharedLinks(
    linkedUserId: string,
    remote_object_id?: string, // folder id or file id
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalSharedLinkOutput[]>>;
}

export interface ISharedLinkMapper {
  desunify(
    source: UnifiedSharedLinkInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalSharedLinkOutput | OriginalSharedLinkOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedSharedLinkOutput | UnifiedSharedLinkOutput[]>;
}
