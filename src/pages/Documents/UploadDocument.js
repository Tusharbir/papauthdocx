import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/ui/PageHeader';
import PDFUploadForm from '../../components/admin/PDFUploadForm';
import ImageUploadForm from '../../components/admin/ImageUploadForm';
import TextUploadForm from '../../components/admin/TextUploadForm';
import Card from '../../components/ui/Card';
import useUIStore from '../../store/uiStore';
import { documentApi } from '../../api/documentApi';

const UploadDocument = () => {
  const [activeTab, setActiveTab] = useState('pdf'); // pdf, image, text
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const mode = useUIStore((state) => state.mode);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Documents', 'Upload']);
  }, [setBreadcrumbs]);

  const mutation = useMutation({
    mutationFn: documentApi.uploadVersion,
    onSuccess: () => {
      enqueueSnackbar('Document registered successfully!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      const errorMsg = error?.response?.data?.message || 'Upload failed';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    },
  });

  const handleSubmit = (values) => {
    const payload = {
      docId: values.docId,
      type: values.type,
      metadata: values.metadata,
      hashes: values.hashes,
      // For superadmin: can optionally specify targetOrgId, defaults to -1 (system-wide)
      // For admin: will use their own orgId automatically
      targetOrgId: values.targetOrgId || undefined
    };
    mutation.mutate(payload);
  };

  const tabs = [
    { id: 'pdf', label: '📄 PDF Documents', icon: '📄' },
    { id: 'image', label: '📷 Scanned Images', icon: '📷' },
    { id: 'text', label: '📝 Text Files', icon: '📝' }
  ];

  const tabClass = (tabId) => {
    const isActive = activeTab === tabId;
    const baseClass = 'px-6 py-3 font-medium rounded-lg transition-all';
    
    if (mode === 'dark') {
      return `${baseClass} ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
      }`;
    } else {
      return `${baseClass} ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
      }`;
    }
  };

  return (
    <div>
      <PageHeader 
        title="Upload Document" 
        subtitle="Register cryptographic hashes from different document types - No documents leave your device!"
      />
      
      {/* Tab Navigation */}
      <Card className="mb-6">
        <div className="flex gap-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={tabClass(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      <div>
        {activeTab === 'pdf' && (
          <PDFUploadForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
        )}
        {activeTab === 'image' && (
          <ImageUploadForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
        )}
        {activeTab === 'text' && (
          <TextUploadForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
        )}
      </div>
    </div>
  );
};

export default UploadDocument;
