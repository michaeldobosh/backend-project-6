// @ts-check

export default {
  translation: {
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        edit: {
          error: 'Не удалось изменить пользователя',
          success: 'Пользователь успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          success: 'Пользователь успешно удалён',
        },
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        edit: {
          error: 'Не удалось изменить статус',
          success: 'Статус успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить статус',
          success: 'Статус успешно удалён',
        },
      },
      tasks: {
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача успешно создана',
        },
        edit: {
          error: 'Не удалось изменить задачу',
          success: 'Задача успешно изменена',
        },
        delete: {
          error: 'Не удалось удалить задачу',
          success: 'Задача успешно удалена',
        },
      },
      labels: {
        create: {
          error: 'Не удалось создать метку',
          success: 'Метка успешно создана',
        },
        edit: {
          error: 'Не удалось изменить метку',
          success: 'Метка успешно изменена',
        },
        delete: {
          error: 'Не удалось удалить метку',
          success: 'Метка успешно удалена',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        statuses: 'Статусы',
        createStatus: 'Создание статуса',
        editStatus: 'Изменение статуса',
        tasks: 'Задачи',
        createTask: 'Создание задачи',
        editTask: 'Изменение задачи',
        labels: 'Метки',
        createLabel: 'Создание метки',
        editLabel: 'Изменение метки',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        id: 'ID',
        firstName: 'Имя',
        lastName: 'Фамилия',
        fullName: 'Полное имя',
        password: 'Пароль',
        email: 'Email',
        createdAt: 'Дата создания',
        actions: {
          actions: 'Действия',
          edit: 'Изменить',
          delete: 'Удалить',
        },
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
        edit: {
          editUser: 'Изменение пользователя',
          submit: 'Изменить',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        actions: {
          create: 'Создать статус',
          new: 'Создать',
          edit: 'Изменить',
          delete: 'Удалить',
        },
      },
      tasks: {
        id: 'ID',
        name: 'Наименование',
        description: 'Описание',
        statusId: 'Статус',
        author: 'Автор',
        executorId: 'Исполнитель',
        label: 'Метка',
        labels: 'Метки',
        createdAt: 'Дата создания',
        only_my_tasks: 'Только мои задачи',
        actions: {
          create: 'Создать задачу',
          new: 'Создать',
          edit: 'Изменить',
          delete: 'Удалить',
          show: 'Показать',
        },
      },
      labels: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        actions: {
          create: 'Создать метку',
          new: 'Создать',
          edit: 'Изменить',
          delete: 'Удалить',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
    },
  },
};
