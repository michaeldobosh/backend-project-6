// @ts-check

export default {
  translation: {
    appName: 'Task Manager',
    flash: {
      session: {
        create: {
          success: 'You are logged in',
          error: 'Wrong email or password',
        },
        delete: {
          success: 'You are logged out',
        },
      },
      users: {
        create: {
          error: 'Failed to register',
          success: 'User registered successfully',
        },
        edit: {
          error: 'Failed to change user',
          success: 'User successfully changed',
        },
        delete: {
          error: 'Failed to delete',
          success: 'User successfully deleted',
        },
      },
      statuses: {
        create: {
          error: 'Error creating status',
          success: 'Status successfully created',
        },
        edit: {
          error: 'Status change error',
          success: 'Status changed successfully',
        },
        delete: {
          error: 'Failed to delete',
          success: 'Status successfully deleted',
        },
      },
      authError: 'Access denied! Please login',
    },
    layouts: {
      application: {
        users: 'Users',
        signIn: 'Login',
        signUp: 'Register',
        signOut: 'Logout',
        statuses: 'Statuses',
        createStatus: 'Creating a status',
        editStatus: 'Change of status',
        tasks: 'Tasks',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Login',
          submit: 'Login',
        },
      },
      users: {
        id: 'ID',
        firstName: 'Name',
        lastName: 'Last Name',
        fullName: 'Name',
        password: 'Password',
        email: 'Email',
        createdAt: 'Created at',
        actions: {
          actions: 'Actions',
          edit: 'Edit',
          delete: 'Delete',
        },
        new: {
          submit: 'Register',
          signUp: 'Register',
        },
        edit: {
          editUser: 'Change user',
          submit: 'Change',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Name',
        createdAt: 'Date of creation',
        actions: {
          create: 'Create status',
          new: 'Create',
          edit: 'Edit',
          delete: 'Delete',
        },
      },
      welcome: {
        index: {
          hello: 'Hello from Hexlet!',
          description: 'Online programming school',
          more: 'Learn more',
        },
      },
    },
  },
};
