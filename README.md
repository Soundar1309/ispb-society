
# ISPB - Indian Society of Plant Breeders Website

A modern, responsive website for the Indian Society of Plant Breeders built with React, TypeScript, and Tailwind CSS.

**Built by**: [Codeficorp](https://codeficorp.dev)

## About This Project

This website serves the Indian Society of Plant Breeders (ISPB), providing a comprehensive platform for:
- Member registration and management
- Conference information and registration
- Life members directory
- Contact and communication
- Administrative tools
- Payment processing for memberships

## Features

- **Modern Design**: Clean, responsive interface with Tailwind CSS
- **User Authentication**: Secure member registration and login
- **Payment Integration**: Razorpay integration for membership fees
- **Admin Panel**: Comprehensive admin tools for content management
- **Real-time Updates**: Live data synchronization
- **Mobile Responsive**: Optimized for all devices

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **React Router DOM** - Client-side routing
- **React Hook Form** - Efficient form handling
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Robust relational database
- **Row Level Security** - Database-level security
- **Real-time subscriptions** - Live data updates

### Payment & Communication
- **Razorpay** - Payment gateway integration
- **Email notifications** - Automated communication
- **Toast notifications** - User feedback system

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Steps

```bash
# Clone the repository
git clone <repository-url>
cd ispb-website

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure your Supabase and Razorpay credentials

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── admin/          # Admin panel components
│   └── header/         # Header-specific components
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations
├── lib/                # Utility functions
└── pages/              # Page components
```

## Key Features

### Public Features
- Homepage with ISPB information
- Genesis and history of the organization
- Office bearers directory
- Conference listings and information
- Contact form
- Life members directory

### Member Features
- Secure user registration and authentication
- Membership purchase and management
- Profile management
- Payment history

### Admin Features
- Content management system
- User and membership management
- Payment tracking and verification
- Conference management
- Message management
- Analytics dashboard

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `memberships` - Membership records and payments
- `contact_messages` - Contact form submissions
- `life_members` - Life members directory
- `conferences` - Conference information
- `user_roles` - Role-based access control

## Security Features

- Row Level Security (RLS) policies
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure payment processing

## Performance Optimizations

- Code splitting and lazy loading
- Image optimization
- Responsive design patterns
- Efficient state management
- Tree-shaking for minimal bundle size

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This project is maintained by Codeficorp. For any issues or feature requests, please contact us through our official channels.

## License

This project is proprietary software developed by Codeficorp for the Indian Society of Plant Breeders.

## Support

For technical support or questions about this website, please contact:
- **Developer**: Codeficorp
- **Website**: https://codeficorp.dev
- **Client**: Indian Society of Plant Breeders

---

**Developed with ❤️ by [Codeficorp](https://codeficorp.dev)**
