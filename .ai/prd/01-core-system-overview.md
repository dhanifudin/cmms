# PRD: Core System Overview

## System Identity
**System**: Computerized Maintenance Management System (CMMS)  
**Purpose**: Track maintenance activities and generate invoices based on completed work  
**Scale**: 116 Terminals across 8 Regions  
**Tech Stack**: Vue.js + Shadcn UI  

## Business Context
- **Integration**: 
  - Talenta HRIS (mocked) for worker and admin authentication
  - Idaman SSO (mocked) for supervisor and leader authentication
- **Primary Output**: Automated invoice generation from maintenance activities
- **Secondary Functions**: Inventory tracking, penalty management, activity notifications, inbox communication

## Core Geographic Structure
- **Terminal**: 116 physical locations
- **Region**: 8 regional groupings of terminals

## Key Business Rules
1. **Work Assignment**: Individual workers only (no team assignments)
2. **Approval Flow**: Admin creates → Supervisor approves → Worker executes
3. **Documentation**: Before/After photos and checklists required
4. **Penalties**: Applied for overdue work orders
5. **Invoicing**: Flexible grouping and automated generation
6. **Communication**: Centralized inbox system for all user interactions
7. **Authentication**: Role-based access via Talenta HRIS or Idaman SSO

## System Integration Points
- **Talenta HRIS**: Worker and admin authentication (mocked)
- **Idaman SSO**: Supervisor and leader authentication (mocked)
- **Mobile Interface**: Worker field operations
- **Notification System**: Multi-channel alerts
- **Communication Hub**: Real-time messaging and notifications

## Main Navigation Structure
- **Inbox**: Universal access for all communications
- **Dashboard**: Role-specific views and KPIs
- **Work Orders**: Management and execution
- **Inventory**: Stock tracking and management
- **Invoicing**: Generation and billing
- **Reports**: Analytics and performance metrics

## Success Metrics
- Complete work order lifecycle demonstration
- Role-based permission enforcement
- Invoice generation accuracy
- Inventory tracking effectiveness
- Communication system functionality
- Dashboard KPI accuracy
- Authentication system integration

## Prototype Scope
**In Scope**: Core workflows, responsive UI, role-based permissions, mock data, communication system, mocked authentication
**Out of Scope**: Real integrations, database persistence, email/SMS, actual SSO implementation

## Open Questions
- Leader role permissions and responsibilities
- Inventory location strategy (Terminal/Regional/Central)
- Labor cost calculation method
- Stock consumption tracking approach
- Penalty responsibility assignment