using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace WinKeyboardHook
{
  public class Result
  {
    String result = "";
    public Result(string r)
    {
      this.result = r;
    }
  }
  public class KeyListener
  {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private static IntPtr _hookID = IntPtr.Zero;

    private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

    public async Task<Object> Start(Object payload = null)
    {
      _hookID = SetHook(HookCallback);
      await Task.Delay(-1);
      return Task.FromResult(new Result("Texto convertido a voz exitosamente") as Object);
    }

    private static IntPtr SetHook(LowLevelKeyboardProc proc)
    {
      using (Process curProcess = Process.GetCurrentProcess())
      using (ProcessModule curModule = curProcess.MainModule)
      {
        IntPtr hModule = GetModuleHandle(curModule.ModuleName);
        return SetWindowsHookEx(WH_KEYBOARD_LL, proc, hModule, 0);
      }
    }

    private IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
    {
      if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN)
      {
        int vkCode = Marshal.ReadInt32(lParam);
        Console.WriteLine("Tecla presionada: " + vkCode);
      }

      return CallNextHookEx(_hookID, nCode, wParam, lParam);
    }

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);
  }
}
