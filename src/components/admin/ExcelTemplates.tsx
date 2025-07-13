import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export const downloadLifeMembersTemplate = () => {
  const headers = [
    'name',
    'designation', 
    'institution',
    'specialization',
    'member_since',
    'email',
    'phone',
    'image_url'
  ];

  const sampleData = [
    [
      'Dr. John Doe',
      'Professor',
      'University of Agriculture',
      'Plant Genetics',
      '2020',
      'john.doe@university.edu',
      '+1234567890',
      'https://example.com/profile1.jpg'
    ],
    [
      'Dr. Jane Smith',
      'Research Scientist',
      'Agricultural Research Institute',
      'Crop Breeding',
      '2019',
      'jane.smith@research.org',
      '+0987654321',
      'https://example.com/profile2.jpg'
    ]
  ];

  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'life_members_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadMembersTemplate = () => {
  const headers = [
    'full_name',
    'email',
    'phone',
    'institution',
    'designation',
    'specialization',
    'membership_type',
    'valid_from',
    'valid_until',
    'amount',
    'member_code'
  ];

  const sampleData = [
    [
      'Dr. John Doe',
      'john.doe@university.edu',
      '+1234567890',
      'University of Agriculture',
      'Professor',
      'Plant Genetics',
      'annual',
      '2024-01-01',
      '2024-12-31',
      '5000',
      'LM-001'
    ],
    [
      'Dr. Jane Smith',
      'jane.smith@research.org',
      '+0987654321',
      'Agricultural Research Institute',
      'Research Scientist',
      'Crop Breeding',
      'lifetime',
      '2024-01-01',
      '2054-01-01',
      '25000',
      'LM-002'
    ]
  ];

  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'members_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const LifeMembersTemplateButton = () => (
  <Button
    variant="outline"
    size="sm"
    onClick={downloadLifeMembersTemplate}
    className="w-full sm:w-auto"
  >
    <Download className="h-4 w-4 mr-2" />
    Download Life Members Template
  </Button>
);

export const MembersTemplateButton = () => (
  <Button
    variant="outline"
    size="sm"
    onClick={downloadMembersTemplate}
    className="w-full sm:w-auto"
  >
    <Download className="h-4 w-4 mr-2" />
    Download Members Template
  </Button>
);