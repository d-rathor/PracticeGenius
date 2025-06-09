# Practice Genius UI Component Library

This document provides usage examples and documentation for the reusable UI components in the Practice Genius application.

## Table of Contents

1. [Button](#button)
2. [Card](#card)
3. [Input](#input)
4. [Badge](#badge)
5. [Alert](#alert)
6. [Modal](#modal)
7. [LoadingSpinner](#loadingspinner)

## Button

The Button component provides a consistent button styling across the application with various variants and sizes.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'secondary' \| 'outline' \| 'ghost' \| 'link' \| 'destructive' | 'default' | The visual style of the button |
| size | 'default' \| 'sm' \| 'lg' \| 'icon' | 'default' | The size of the button |
| fullWidth | boolean | false | Whether the button should take up the full width of its container |
| isLoading | boolean | false | Whether to show a loading spinner inside the button |

### Usage Examples

```tsx
// Default orange button
<Button>Sign Up</Button>

// Secondary gray button
<Button variant="secondary">Cancel</Button>

// Outline button
<Button variant="outline">Learn More</Button>

// Small button
<Button size="sm">Small Button</Button>

// Large button
<Button size="lg">Large Button</Button>

// Full width button
<Button fullWidth>Full Width Button</Button>

// Loading state
<Button isLoading>Processing...</Button>

// Disabled state
<Button disabled>Unavailable</Button>
```

## Card

The Card component provides a container for content with consistent styling and optional header, footer, and content sections.

### Components

- `Card`: The main container
- `CardHeader`: The header section of the card
- `CardTitle`: The title within the header
- `CardDescription`: A description within the header
- `CardContent`: The main content area of the card
- `CardFooter`: The footer section of the card

### Card Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'bordered' \| 'elevated' | 'default' | The visual style of the card |

### Usage Examples

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>This is the main content of the card.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Bordered card
<Card variant="bordered">
  <CardContent>Bordered card content</CardContent>
</Card>

// Elevated card with more shadow
<Card variant="elevated">
  <CardContent>Elevated card content</CardContent>
</Card>
```

## Input

The Input component provides a styled input field with optional label and error states.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | undefined | Label text for the input |
| error | string | undefined | Error message to display below the input |
| helperText | string | undefined | Helper text to display below the input when there's no error |

### Usage Examples

```tsx
// Basic input
<Input placeholder="Enter your name" />

// Input with label
<Input label="Email Address" placeholder="example@email.com" />

// Input with helper text
<Input 
  label="Username" 
  placeholder="Choose a username"
  helperText="Username must be at least 3 characters" 
/>

// Input with error
<Input 
  label="Password" 
  type="password"
  error="Password must be at least 8 characters" 
/>

// Disabled input
<Input label="Read Only Field" value="Cannot be changed" disabled />
```

## Badge

The Badge component displays small labels, tags, or status indicators.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'secondary' \| 'success' \| 'destructive' \| 'warning' \| 'info' \| 'outline' | 'default' | The visual style of the badge |

### Usage Examples

```tsx
// Default orange badge
<Badge>New</Badge>

// Secondary gray badge
<Badge variant="secondary">Pending</Badge>

// Success green badge
<Badge variant="success">Completed</Badge>

// Destructive red badge
<Badge variant="destructive">Failed</Badge>

// Warning yellow badge
<Badge variant="warning">Warning</Badge>

// Info blue badge
<Badge variant="info">Info</Badge>

// Outline badge
<Badge variant="outline">Custom</Badge>
```

## Alert

The Alert component displays important messages to the user.

### Components

- `Alert`: The main container
- `AlertTitle`: The title of the alert
- `AlertDescription`: The description text of the alert

### Alert Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'info' \| 'warning' \| 'success' \| 'error' | 'default' | The visual style of the alert |

### Usage Examples

```tsx
// Default alert
<Alert>
  <AlertTitle>Note</AlertTitle>
  <AlertDescription>This is a default alert.</AlertDescription>
</Alert>

// Info alert
<Alert variant="info">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is an informational alert.</AlertDescription>
</Alert>

// Warning alert
<Alert variant="warning">
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>This is a warning alert.</AlertDescription>
</Alert>

// Success alert
<Alert variant="success">
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>This is a success alert.</AlertDescription>
</Alert>

// Error alert
<Alert variant="error">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>This is an error alert.</AlertDescription>
</Alert>
```

## Modal

The Modal component displays content in a dialog that appears on top of the main content.

### Components

- `Modal`: The main container and backdrop
- `ModalHeader`: The header section of the modal
- `ModalBody`: The main content area of the modal
- `ModalFooter`: The footer section of the modal

### Modal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | boolean | - | Whether the modal is visible |
| onClose | () => void | - | Function to call when the modal should close |
| size | 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' | 'md' | The size of the modal |

### Usage Examples

```tsx
// Basic usage with React state
const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Open Modal</Button>

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <ModalHeader onClose={() => setIsOpen(false)}>Modal Title</ModalHeader>
  <ModalBody>
    <p>This is the modal content.</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button>Confirm</Button>
  </ModalFooter>
</Modal>

// Different sizes
<Modal isOpen={isOpen} onClose={onClose} size="sm">
  <ModalBody>Small modal content</ModalBody>
</Modal>

<Modal isOpen={isOpen} onClose={onClose} size="lg">
  <ModalBody>Large modal content</ModalBody>
</Modal>
```

## LoadingSpinner

The LoadingSpinner component displays a loading indicator.

### Usage Examples

```tsx
// Default spinner
<LoadingSpinner />

// With custom size
<LoadingSpinner size="lg" />

// With custom color
<LoadingSpinner color="orange" />
```

## Accessibility Considerations

All components are built with accessibility in mind:

- Proper ARIA attributes are used where appropriate
- Focus management is implemented for interactive components
- Color contrast meets WCAG standards
- Keyboard navigation is supported

## Best Practices

1. Use consistent component variants throughout the application
2. Provide descriptive labels and helper text for form inputs
3. Use appropriate alert variants based on the message importance
4. Ensure modals have clear titles and close buttons
5. Use badges sparingly to highlight important information
