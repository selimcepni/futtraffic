"""Check the GPU used by the match worker before accepting local uploads."""
import os
import sys

import torch


def main():
    if not torch.cuda.is_available():
        sys.exit("CUDA bulunamadi. Docker Desktop WSL2 ve NVIDIA surucusunu kontrol edin.")
    value = torch.tensor([2.0], device="cuda").square().item()
    if value != 4.0:
        sys.exit("GPU hesaplama testi basarisiz.")
    print(f"GPU hazir: {torch.cuda.get_device_name(0)} / CUDA {torch.version.cuda}", flush=True)
    os.execv(sys.executable, [sys.executable, "app/server/app.py"])


if __name__ == "__main__":
    main()
