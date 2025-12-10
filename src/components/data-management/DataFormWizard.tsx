import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ChevronLeft, ChevronRight, Save, Upload, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['active', 'inactive', 'pending']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high']),
  tags: z.array(z.string()),
  richContent: z.string().optional(),
  attachments: z.array(z.instanceof(File)).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DataFormWizardProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onSaveDraft?: (data: Partial<FormData>) => void;
  onCancel: () => void;
}

const steps = [
  { id: 'basic', title: 'Basic Information', description: 'Enter the basic details' },
  { id: 'details', title: 'Additional Details', description: 'Add more information' },
  { id: 'content', title: 'Rich Content', description: 'Add rich text content' },
  { id: 'attachments', title: 'Attachments', description: 'Upload files' },
  { id: 'review', title: 'Review & Submit', description: 'Review and submit' },
];

export const DataFormWizard: React.FC<DataFormWizardProps> = ({
  initialData,
  onSubmit,
  onSaveDraft,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [attachments, setAttachments] = useState<File[]>(initialData?.attachments || []);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      status: initialData?.status || 'pending',
      category: initialData?.category || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      tags: initialData?.tags || [],
      richContent: initialData?.richContent || '',
      attachments: initialData?.attachments || [],
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();

  // Auto-save functionality
  React.useEffect(() => {
    if (autoSaveEnabled && onSaveDraft) {
      const timeoutId = setTimeout(() => {
        onSaveDraft({
          ...watchedValues,
          attachments,
        });
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, attachments, autoSaveEnabled, onSaveDraft]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    setValue('attachments', [...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    setValue('attachments', newAttachments);
  };

  const addTag = (tag: string) => {
    if (tag && !watchedValues.tags?.includes(tag)) {
      setValue('tags', [...(watchedValues.tags || []), tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedValues.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      attachments,
    });
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input {...register('name')} placeholder="Enter name" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={watchedValues.status} onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input {...register('category')} placeholder="Enter category" />
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={watchedValues.priority} onValueChange={(value) => setValue('priority', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea {...register('description')} placeholder="Enter description" rows={4} />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {watchedValues.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tag and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rich Content</label>
              <ReactQuill
                value={watchedValues.richContent || ''}
                onChange={(value) => setValue('richContent', value)}
                theme="snow"
                className="mt-2"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Attachments</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload files
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Uploaded Files:</h4>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Information</CardTitle>
                <CardDescription>Please review all details before submitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Name:</strong> {watchedValues.name}
                  </div>
                  <div>
                    <strong>Status:</strong> {watchedValues.status}
                  </div>
                  <div>
                    <strong>Category:</strong> {watchedValues.category}
                  </div>
                  <div>
                    <strong>Priority:</strong> {watchedValues.priority}
                  </div>
                </div>
                <div>
                  <strong>Description:</strong>
                  <p className="mt-1 text-sm">{watchedValues.description}</p>
                </div>
                {watchedValues.tags && watchedValues.tags.length > 0 && (
                  <div>
                    <strong>Tags:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {watchedValues.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {watchedValues.richContent && (
                  <div>
                    <strong>Rich Content:</strong>
                    <div className="mt-1 text-sm" dangerouslySetInnerHTML={{ __html: watchedValues.richContent }} />
                  </div>
                )}
                {attachments.length > 0 && (
                  <div>
                    <strong>Attachments:</strong>
                    <ul className="mt-1 text-sm">
                      {attachments.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Create New Item</h2>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-save"
              checked={autoSaveEnabled}
              onCheckedChange={(checked) => setAutoSaveEnabled(checked === true)}
            />
            <label htmlFor="auto-save" className="text-sm">Auto-save drafts</label>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`text-xs ${index <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            {renderStepContent()}

            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex space-x-2">
                {onSaveDraft && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onSaveDraft({ ...watchedValues, attachments })}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                {currentStep === steps.length - 1 ? (
                  <Button type="submit">
                    Submit
                  </Button>
                ) : (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};