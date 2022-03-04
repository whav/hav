from pick import pick
from pathlib import Path

env_files_dir = Path(__file__).parent.resolve().joinpath("./env_files/")

env_files = env_files_dir.glob("*.env")
env_files = filter(lambda x: x.is_file(), env_files)
env_files = list(sorted(env_files))

options = [f.name for f in env_files]

current_env_link = Path(__file__).parent.resolve().joinpath(".env")
current_index = 0

if current_env_link.exists() and not current_env_link.is_symlink():
    raise ValueError(".env file exists and is not a symbolic link.")


if current_env_link.resolve() in env_files:
    current_index = env_files.index(current_env_link.resolve())
    options[current_index] += " (current)"


title = "\n".join(
    [
        "Please choose the environment you want to work with:",
        "(see https://github.com/docker/compose/issues/6170 for details)",
    ]
)

option, index = pick(options, title, default_index=current_index)

if current_env_link.exists():
    current_env_link.unlink()

current_env_link.symlink_to(env_files[index])

# print(option, index)
