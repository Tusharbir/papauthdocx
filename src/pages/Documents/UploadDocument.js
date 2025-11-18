import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/ui/PageHeader';
import UploadDocumentForm from '../../components/admin/UploadDocumentForm';
import useUIStore from '../../store/uiStore';
import { documentApi } from '../../api/documentApi';

const UploadDocument = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX+', 'Documents', 'Upload']);
  }, [setBreadcrumbs]);

  const mutation = useMutation({
    mutationFn: documentApi.uploadVersion,
    onSuccess: () => {
      enqueueSnackbar('Document version uploaded.', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: () => enqueueSnackbar('Upload failed.', { variant: 'error' }),
  });

  const handleSubmit = (values) => {
    const payload = {
      documentId: values.docId,
      type: values.type,
      metadata: {
        fileType: values.fileType,
        pageCount: values.pageCount ? Number(values.pageCount) : undefined,
        sizeInKB: values.sizeInKB ? Number(values.sizeInKB) : undefined,
        mimeType: values.mimeType,
      },
      hashes: values.hashes,
    };
    mutation.mutate(payload);
  };

  return (
    <div>
      <PageHeader title="Upload document version" subtitle="Register metadata + multi-modal hashes" />
      <UploadDocumentForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
    </div>
  );
};

export default UploadDocument;
