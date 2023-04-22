export const InitApp = async (start: () => void) => {
    //@ts-ignore
    process.on('unhandledRejection', (reason, promise) => {
        // console.error('Promesa rechazada sin manejo de errores:', reason);
        // Aquí puedes agregar lógica adicional para manejar el error.
    });
    process.on('uncaughtException', (error) => {
        // console.error('Error no capturado:', error);

        setTimeout(() => {
            start();
        }, 1000);
        // Aquí puedes agregar lógica adicional para manejar el error, como reiniciar tu aplicación o enviar una notificación.
    });

    // while (true) {
    await Promise.resolve(start())
    // }
}