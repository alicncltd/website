from pprint import pprint

from modules.technical import TechnicalAnalyst


def main():

    analyst = TechnicalAnalyst()

    report = analyst.analyze()

    print("\n========== ORACLE TECHNICAL REPORT ==========\n")

    pprint(report)

    print("\n=============================================\n")


if __name__ == "__main__":
    main()