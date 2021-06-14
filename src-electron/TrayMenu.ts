import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron';
import path from 'path';

export class TrayMenu {
  public readonly tray: Tray;

  private iconPath = path.resolve(
    __dirname,
    process.env.QUASAR_PUBLIC_FOLDER as string,
    'favicon.ico'
  );

  constructor() {
    this.tray = new Tray(this.iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Sentinel',
        type: 'normal',
        click: () =>
          BrowserWindow.getAllWindows().forEach((window) => window.show()),
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        type: 'normal',
        click: () => app.quit(),
      },
    ]);

    this.tray.setToolTip('Sentinel');
    this.tray.setContextMenu(contextMenu);
  }
}
